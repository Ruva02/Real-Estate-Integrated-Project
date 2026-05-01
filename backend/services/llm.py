import json
import re
import time
import traceback
from typing import Optional, List, Any, Dict
from datetime import datetime
from services.db import SessionLocal
from models.property_model import Property
from models.chat_model import ChatSession
import os
from sqlalchemy import func
from dotenv import load_dotenv
import litellm

# Use absolute path for .env
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(BASE_DIR, '.env')
load_dotenv(dotenv_path=env_path)



def perform_db_search(query_text: str) -> str:
    db = SessionLocal()
    try:
        # More flexible regex to handle various formats
        action_match = re.search(r"action\s*[:=]\s*(\w+)", query_text, re.I)
        location_match = re.search(r"location\s*[:=]\s*([\w\s]+)", query_text, re.I)
        bhk_match = re.search(r"bhk\s*[:=]\s*(\d+)", query_text, re.I)
        price_match = re.search(r"price\s*[:=]\s*(\d+)", query_text, re.I)
        
        q = db.query(Property)
        if action_match: 
            q = q.filter(func.lower(Property.action) == action_match.group(1).lower())
        if location_match: 
            q = q.filter(func.lower(Property.city) == location_match.group(1).strip().lower())
        if bhk_match: 
            q = q.filter(Property.bedrooms == int(bhk_match.group(1)))
        if price_match: 
            q = q.filter(Property.price <= float(price_match.group(1)))
            
        results = q.order_by(Property.price.asc()).limit(6).all()
        if not results: return "[No matches found]"
        
        # Return full dictionary for each property
        essential = []
        for p in results:
            d = p.to_dict()
            # Keep both _id (for frontend type) and property_id (for backend extraction check)
            d['property_id'] = d.get('_id') or str(p.id)
            essential.append(d)
            
        return "MANDATORY_JSON_RESULTS: " + json.dumps(essential)
    except Exception as e:
        print(f"Search Error: {e}")
        return "[Search Failed]"
    finally: db.close()

GROQ_KEY_MAIN = os.getenv("GROQ_API_KEY")
GROQ_KEY_ACADEMY = os.getenv("GROQ_API_KEY_ACADEMY")

def get_session_history(email: str) -> List[Dict]:
    db = SessionLocal()
    try:
        session = db.query(ChatSession).filter(ChatSession.email == email).first()
        return [m for m in session.history if isinstance(m, dict)] if session else []
    finally: db.close()

def save_session_history(email: str, history: List[Dict]):
    db = SessionLocal()
    try:
        session = db.query(ChatSession).filter(ChatSession.email == email).first()
        valid = [m for m in history[-10:] if isinstance(m, dict)]
        if session:
            session.history = valid
            session.last_updated = datetime.utcnow()
        else:
            session = ChatSession(email=email, history=valid)
            db.add(session)
        db.commit()
    except Exception as e: print(f"Save History Error: {e}")
    finally: db.close()

def clean_history_for_context(history: List[Dict], limit: int = 3) -> str:
    clean = []
    for m in history[-limit:]:
        content = str(m.get('content', ''))
        content = re.sub(r"(MANDATORY_JSON_RESULTS|SEARCH).*?(\[|\{).*?(\]|\})", "[Technical Data]", content, flags=re.DOTALL | re.IGNORECASE)
        content = re.sub(r"(MANDATORY_QUIZ_JSON).*?\{.*?\}", "[Quiz Data]", content, flags=re.DOTALL | re.IGNORECASE)
        clean.append(f"{m.get('role', 'user')}: {content[:100]}")
    return "\n".join(clean)

def process_chat_message(email: str, message: str, mode: str = 'concierge') -> str:
    try:
        history = get_session_history(email)
        is_quiz_start = "quiz" in message.lower() or "restart" in message.lower()

        if mode == 'tutor':
            api_key = GROQ_KEY_ACADEMY
            recent = history[-10:]
            quiz_count = sum(1 for m in recent if "MANDATORY_QUIZ_JSON" in str(m.get('content', '')))
            
            # Determine if we should be in Quiz Mode
            last_msg = next((m for m in reversed(history) if m.get('role') == 'assistant'), None)
            was_last_msg_quiz = last_msg and "MANDATORY_QUIZ_JSON" in str(last_msg.get('content', ''))
            
            should_quiz = is_quiz_start or (was_last_msg_quiz and quiz_count < 5)
            
            system_prompt = """You are Haven Professor. REAL ESTATE SPECIALIST.
            
            MODES:
            1. TEACHING MODE: If the user asks a question, answer it thoroughly and professionally. DO NOT include a JSON quiz block.
            2. QUIZ MODE: If the user says 'quiz' or is currently answering a quiz, you MUST provide exactly one JSON block.
               FORMAT: MANDATORY_QUIZ_JSON: {"question": "...", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "..."}
            
            CRITICAL: Only use QUIZ MODE if explicitly requested or if a quiz is already in progress."""
            
            context = clean_history_for_context(history, limit=4)
            if should_quiz:
                num = 1 if is_quiz_start else quiz_count + 1
                user_content = f"QUIZ MODE: Question {num}/5. Context: {context}\nUser: {message}\nTask: Give feedback on the previous answer if any, then ask the next question in MANDATORY_QUIZ_JSON format."
            else:
                user_content = f"TEACHING MODE: Answer the user's question. Context: {context}\nUser: {message}"
            
            if not api_key:
                raise ValueError("GROQ_API_KEY_ACADEMY is missing or empty")
                
            response = litellm.completion(
                model="groq/llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                api_key=api_key,
                temperature=0.2,
                max_tokens=1024
            )
            result_str = response.choices[0].message.content
        else:
            api_key = GROQ_KEY_MAIN
            system_prompt = """You are Haven Concierge. ELITE REAL ESTATE SPECIALIST.
            
            YOUR GOAL: Conduct a professional inquiry to understand the user's property needs.
            
            CRITICAL RULES:
            1. ANALYSIS: ALWAYS include an <analysis> JSON block at the end of every response.
               Format: <analysis>{"category": "Rent/Buy/Sell", "location": "City", "budget": "Amount", "bhk": "Number", "urgency": "High/Low"}</analysis>
            2. INFORMATION GATHERING: If the user hasn't provided their Location, Budget, or BHK, ask for them politely. Do not ask for everything at once; be conversational.
            3. SEARCH: Whenever you have a location and action (buy/rent), you MUST include a line: SEARCH: action=..., location=... 
               This triggers the property grid. DO NOT ASK for more info if you already have these two. Just trigger the search.
            4. PERSISTENCE: If the user provides info, use it immediately. Do not repeat questions the user has already answered.
            5. NO TEXT LISTS: NEVER provide property descriptions, prices, or lists in your text response. All properties must be found via the SEARCH: tool.
            5. INTERACTIVE BUTTONS: Always provide 2-4 helpful follow-up options using MANDATORY_OPTIONS_JSON: ["Option 1", "Option 2", ...]
            
            Persona: Sophisticated, helpful, and efficient. NEVER repeat information found in search results."""
            context = clean_history_for_context(history, limit=2)
            if not api_key:
                raise ValueError("GROQ_API_KEY is missing or empty")

            response = litellm.completion(
                model="groq/llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Context:\n{context}\n\nUser: {message}"}
                ],
                api_key=api_key,
                temperature=0.2,
                max_tokens=1024
            )
            result_str = response.choices[0].message.content
            
            # Case-insensitive search trigger and logging
            print(f"DEBUG: Concierge Response: {result_str[:100]}...")
            if "SEARCH:" in result_str.upper():
                search_results = perform_db_search(result_str)
                result_str += f"\n\n{search_results}"

        history.append({"role": "user", "content": message, "timestamp": datetime.utcnow().isoformat()})
        history.append({"role": "assistant", "content": result_str, "timestamp": datetime.utcnow().isoformat()})
        save_session_history(email, history)
        return result_str

    except Exception as e:
        print(f"Process Chat Error: {e}")
        traceback.print_exc()
        return f"I encountered a technical hiccup. ({str(e)[:100]})"

def parse_analysis(text: str) -> dict:
    try:
        match = re.search(r"<analysis>(.*?)</analysis>", text, re.DOTALL)
        if match:
            data = json.loads(match.group(1))
            return data[0] if isinstance(data, list) else data
    except: pass
    return {"category": "General", "urgency": "Low", "location": None, "budget": None, "bhk": None, "ids": [], "dates": []}
