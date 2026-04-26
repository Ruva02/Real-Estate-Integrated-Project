from flask import Blueprint, request, jsonify
from utils.token_utils import token_required
from services.llm import process_chat_message, parse_analysis
from services.user_service import log_inquiry
from models.chat_model import ChatSession
from services.db import SessionLocal
import json
import re
from json_repair import repair_json

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST'])
@token_required
def chat():
    email = request.user
    data = request.json
    message = data.get('message')
    mode = data.get('mode', 'concierge')
    
    if not message:
        return jsonify({"error": "Message is required"}), 400
        
    try:
        full_response = process_chat_message(email, message, mode)
        
        # 1. Flexible Quiz Extraction (Finds JSON object containing "question")
        quiz_data = None
        # Look for any JSON object that looks like a quiz
        quiz_match = re.search(r"(\{.*\"question\".*?\"options\".*?\})", full_response, re.DOTALL)
        if quiz_match:
            try:
                repaired_quiz = repair_json(quiz_match.group(1))
                quiz_data = json.loads(repaired_quiz)
                # Ensure options is a list
                if not isinstance(quiz_data.get('options'), list) or len(quiz_data['options']) == 0:
                    quiz_data = None # Invalid quiz
            except Exception as e:
                print(f"Error parsing quiz: {e}")
        
        # 1.5 Extract Options (Concierge mode)
        options_data = None
        options_match = re.search(r"MANDATORY_OPTIONS_JSON:?\s*(\[.*?\])", full_response, re.DOTALL | re.IGNORECASE)
        if options_match:
            try:
                repaired_options = repair_json(options_match.group(1))
                options_data = json.loads(repaired_options)
            except Exception as e:
                print(f"Error parsing options: {e}")

        # 2. Extract Properties (Concierge mode)
        def extract_json_array(text):
            potential_arrays = re.findall(r"(\[[\s\S]*?\])", text)
            for arr in potential_arrays:
                try:
                    repaired = repair_json(arr)
                    parsed = json.loads(repaired)
                    if isinstance(parsed, list) and len(parsed) > 0:
                        if 'property_id' in parsed[0] or 'title' in parsed[0]:
                            return parsed
                except: continue
            return []

        property_results = extract_json_array(full_response)
        
        # 3. Extract Analysis
        analysis = parse_analysis(full_response)
        if analysis and mode == 'concierge':
            try:
                log_inquiry(email, message, analysis)
            except Exception as e:
                print(f"Failed to log inquiry: {e}")

        # 4. Final Text Cleanup (Removes ALL technical blocks)
        def clean_output(text):
            # Remove <analysis> tags
            text = re.sub(r"<analysis>.*?</analysis>", "", text, flags=re.DOTALL)
            # Remove SEARCH: command line only
            text = re.sub(r"SEARCH:.*?(?=\n|$)", "", text, flags=re.IGNORECASE)
            # Remove ANY block that looks like a Quiz JSON
            text = re.sub(r"MANDATORY_QUIZ_JSON.*?(\{.*?\})", "", text, flags=re.DOTALL | re.IGNORECASE)
            text = re.sub(r"MANDATORY_JSON_RESULTS.*?(\[.*?\])", "", text, flags=re.DOTALL | re.IGNORECASE)
            text = re.sub(r"MANDATORY_OPTIONS_JSON.*?(\[.*?\])", "", text, flags=re.DOTALL | re.IGNORECASE)
            # Remove numbered property lists (hallucinations)
            text = re.sub(r"\d+\.\s+.*?(apartment|house|studio|room|bhk|sq-ft|month).*?(\n|$)", "", text, flags=re.IGNORECASE)
            # Remove any standalone JSON blocks
            text = re.sub(r"```json.*?```", "", text, flags=re.DOTALL)
            text = re.sub(r"\{.*\"question\".*?\}", "", text, flags=re.DOTALL)
            text = re.sub(r"\[.*\"property_id\".*?\]", "", text, flags=re.DOTALL)
            return text.strip()

        final_text = clean_output(full_response)
        
        return jsonify({
            "response": final_text or "How can I help you further?",
            "properties": property_results,
            "quiz": quiz_data,
            "options": options_data,
            "analysis": analysis
        }), 200
        
    except Exception as e:
        print(f"Error in chat: {e}")
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/chat/clear', methods=['DELETE'])
@token_required
def clear_chat():
    email = request.user
    db = SessionLocal()
    try:
        session = db.query(ChatSession).filter(ChatSession.email == email).first()
        if session:
            db.delete(session)
            db.commit()
        return jsonify({"message": "History cleared"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
