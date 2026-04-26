"use client";

import { useState, useEffect, useRef } from 'react';
import { Message, Property } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5016';

export const useChat = (token: string | null, handleLogout: () => void, mode: 'concierge' | 'tutor' = 'concierge') => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'agent',
            text: mode === 'tutor' 
                ? "Welcome to Haven Academy. I'm your Real Estate Professor. Would you like to learn about a concept or take a quiz to test your knowledge?"
                : "Welcome to Haven AI. I'm your elite real estate concierge. Are you looking to Buy, Rent, or Sell today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [foundProperties, setFoundProperties] = useState<Property[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const refreshAccessToken = async () => {
        const refreshToken = sessionStorage.getItem('refresh_token');
        if (!refreshToken) return null;

        try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (!response.ok) throw new Error("Refresh failed");

            const data = await response.json();
            sessionStorage.setItem('access_token', data.access_token);
            return data.access_token;
        } catch (error) {
            console.error("Token refresh error:", error);
            handleLogout();
            return null;
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            type: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);

        const performChatRequest = async (currentToken: string | null) => {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify({ message: currentInput, mode })
            });

            if (response.status === 401) {
                const refreshedToken = await refreshAccessToken();
                if (refreshedToken) {
                    return fetch(`${API_URL}/chat`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${refreshedToken}`
                        },
                        body: JSON.stringify({ message: currentInput, mode })
                    });
                }
            }
            return response;
        };

        try {
            const response = await performChatRequest(token);
            let data: any;
            try {
                data = await response.json();
            } catch (jsonErr) {
                console.error("Failed to parse JSON response:", jsonErr);
                data = { error: "The server returned an invalid response." };
            }

            if (!response.ok) {
                let errorText = data.error || "An unexpected error occurred.";
                // Quota handling
                if (errorText.includes("quota") || errorText.includes("RESOURCE_EXHAUSTED")) {
                    errorText = "Great things take time! I've reached my daily limit for free AI consultations. Please try again tomorrow or consider upgrading your plan.";
                } else if (errorText.includes("Token expired") || response.status === 401) {
                    errorText = "Your session has ended. Please log in again to continue.";
                    handleLogout();
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    type: 'agent',
                    text: errorText,
                    timestamp: new Date()
                }]);
                return;
            }

            // Directly use structured properties from backend
            const cleanText = data.response;
            const extractedProps: Property[] = data.properties || [];
            const quizData = data.quiz;
            const optionsData = data.options;
 
            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                type: 'agent',
                text: cleanText,
                timestamp: new Date(),
                properties: extractedProps.length > 0 ? extractedProps : undefined,
                quiz: quizData || undefined,
                options: optionsData || undefined
            };

            setMessages(prev => [...prev, agentMsg]);
            if (extractedProps.length > 0) {
                setFoundProperties(extractedProps);
            }

        } catch (error: any) {
            console.error("Silent Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'agent',
                text: "I'm having trouble connecting to my central intelligence. Please ensure the backend is active.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        input,
        setInput,
        isLoading,
        foundProperties,
        handleSendMessage,
        scrollRef
    };
};
