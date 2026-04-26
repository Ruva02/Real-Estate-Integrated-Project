"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MapPin, ExternalLink, MessageCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import PropertyDetailsModal from './PropertyDetailsModal';
import { Property } from '../types';

export const ChatInterface = ({ token, handleLogout, mode = 'concierge' }: { token: string | null, handleLogout: () => void, mode?: 'concierge' | 'tutor' }) => {
    const {
        messages,
        input,
        setInput,
        isLoading,
        handleSendMessage,
        scrollRef
    } = useChat(token, handleLogout, mode);

    const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);

    return (
        <div id="ai-chat" className="flex flex-col h-full space-y-8">
            {/* Property Grid Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                    {messages.filter(m => m.properties).slice(-1).map((m) => (
                        m.properties?.map((prop: Property, idx: number) => (
                            <motion.div
                                key={`${prop.title}-${idx}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="property-card cursor-pointer group"
                                onClick={() => setSelectedProperty(prop)}
                            >
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    <img 
                                        src={`https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600`} 
                                        alt={prop.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-gray-900 shadow-sm">
                                        {prop.action === 'Buy' ? 'For Sale' : 'For Rent'}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 line-clamp-1">{prop.title}</h3>
                                        <p className="text-slate-800 font-bold">₹{prop.price?.toLocaleString() || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
                                        <MapPin className="w-3 h-3" /> {prop.city}
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                        <div className="flex gap-4 text-xs font-medium text-gray-500">
                                            <span>{prop.bedrooms} BHK</span>
                                            <span>{prop.area_sqft} sqft</span>
                                        </div>
                                        <button className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ))}
                </AnimatePresence>
            </div>

            {/* Chat Box Widget */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                    <div className={`w-10 h-10 ${mode === 'tutor' ? 'bg-indigo-100' : 'bg-slate-100'} rounded-xl flex items-center justify-center`}>
                        <Sparkles className={`w-5 h-5 ${mode === 'tutor' ? 'text-indigo-600' : 'text-slate-600'}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{mode === 'tutor' ? 'Haven Professor' : 'Haven Concierge'}</h3>
                        <p className="text-xs text-gray-400">{mode === 'tutor' ? 'Academic Advisor' : 'Online & Ready to Help'}</p>
                    </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto mb-6 space-y-4 scroll-hide px-2">
                    {messages.length === 0 && (
                        <div className="text-center py-10">
                            <MessageCircle className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">Tell me what you're looking for!</p>
                        </div>
                    )}
                    {messages.map((m, idx) => (
                        <div key={idx} className="space-y-4">
                            <div className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-3 text-sm ${
                                    m.type === 'user' 
                                    ? 'bg-slate-800 text-white rounded-2xl rounded-tr-none' 
                                    : 'bg-gray-50 text-gray-700 rounded-2xl rounded-tl-none border border-gray-100'
                                }`}>
                                    {m.text}
                                </div>
                            </div>

                            {/* GenAI Quiz Card */}
                            {m.quiz && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-lg"
                                >
                                    <div className="flex items-center gap-2 mb-4 text-indigo-600">
                                        <HelpCircle className="w-5 h-5" />
                                        <span className="font-bold text-xs uppercase tracking-widest">Real Estate Quiz</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-6">{m.quiz.question}</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {m.quiz.options?.map((opt, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    const optionText = (opt && typeof opt === 'object') ? (opt as any).option : opt;
                                                    const quizAnswer = m.quiz?.answer || (m.quiz as any).correct_answer;
                                                    if (!optionText || !quizAnswer) return;
                                                    const selected = String(optionText).trim().toUpperCase();
                                                    const correct = String(quizAnswer || '').trim().toUpperCase();
                                                    
                                                    if (!correct) return;

                                                    // Improved logic: 
                                                    // 1. Exact match
                                                    // 2. If correct is just 'B', and selected is 'B. SOMETHING' or 'B) SOMETHING'
                                                    const isCorrect = 
                                                        selected === correct || 
                                                        (correct.length === 1 && selected.startsWith(correct)) ||
                                                        (selected.length === 1 && correct.startsWith(selected));

                                                    const feedbackText = isCorrect 
                                                        ? `✅ Correct!\n\n${m.quiz?.explanation || 'Well done!'}` 
                                                        : `❌ Incorrect.\n\nThe correct answer was: ${quizAnswer}\n\n${m.quiz?.explanation || ''}`;
                                                     
                                                    alert(feedbackText);

                                                    // Automatically send the answer to trigger the Professor's explanation and next question
                                                    const feedbackMsg = `Answer: ${optionText} - ${isCorrect ? 'Correct!' : 'Incorrect!'}`;
                                                    setInput(feedbackMsg);
                                                    
                                                    setTimeout(() => {
                                                        const sendBtn = document.getElementById('chat-send-button');
                                                        sendBtn?.click();
                                                    }, 50);
                                                }}
                                                className="w-full text-left p-3 rounded-xl border border-slate-50 hover:bg-slate-50 hover:border-slate-200 transition-all text-sm text-slate-600 flex items-center justify-between group"
                                            >
                                                {typeof opt === 'object' ? (opt as any).option : opt}
                                                <CheckCircle2 className="w-4 h-4 opacity-0 group-hover:opacity-100 text-slate-300" />
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
 
                            {/* Interaction Options */}
                            {m.options && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {m.options.map((opt, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            onClick={() => {
                                                setInput(opt);
                                                setTimeout(() => {
                                                    document.getElementById('chat-send-button')?.click();
                                                }, 50);
                                            }}
                                            className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm flex items-center gap-2 group"
                                        >
                                            {opt}
                                            <Sparkles className="w-3 h-3 text-slate-300 group-hover:text-slate-400" />
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex gap-1">
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75" />
                                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    )}
                </div>

                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="relative"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={mode === 'tutor' ? "Ask about REITs, Mortgages, or say 'Quiz'..." : "Try '3 BHK in Indore under 80 Lakhs'..."}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                    <button
                        id="chat-send-button"
                        type="submit"
                        disabled={isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>

            {selectedProperty && (
                <PropertyDetailsModal 
                    property={selectedProperty} 
                    onClose={() => setSelectedProperty(null)} 
                />
            )}
        </div>
    );
};
