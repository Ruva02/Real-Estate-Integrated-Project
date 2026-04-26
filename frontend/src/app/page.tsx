"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ChatInterface } from '../components/ChatInterface';
import { Footer } from '../components/Footer';
import { useRouter } from 'next/navigation';
import { Filter, Grid, List as ListIcon, Sparkles, Lock } from 'lucide-react';

export default function HavenAI() {
    const [token, setToken] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const storedToken = sessionStorage.getItem('access_token');
        if (!storedToken) {
            router.push('/login');
        } else {
            setToken(storedToken);
        }
    }, [router]);

    const handleLogout = async () => {
        const token = sessionStorage.getItem('access_token');
        if (token) {
            try {
                await fetch('http://localhost:5016/chat/clear', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (err) {
                console.error("Failed to clear history on server:", err);
            }
        }
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        setToken(null);
        window.location.href = '/login';
    };

    if (!mounted) return null;

    return (
        <div className="flex bg-white min-h-screen">
            <Sidebar handleLogout={handleLogout} token={token} />
            
            <div className="flex-1 flex flex-col">
                <Navbar 
                    token={token} 
                    isMenuOpen={false} 
                    setIsMenuOpen={() => {}} 
                    handleLogout={handleLogout} 
                />

                <main className="p-10 ml-0 flex-1">
                    <div className="max-w-7xl mx-auto pl-[240px]">
                        {/* Header Section */}
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <p className="text-slate-500 font-semibold text-sm mb-2 uppercase tracking-wider">Dashboard</p>
                                <h1 className="text-3xl font-bold text-slate-900">Explore Properties</h1>
                                <p className="text-slate-500 mt-1">Discover your next investment with AI-powered insights.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                                    <Filter className="w-4 h-4" /> Filters
                                </button>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><Grid className="w-4 h-4" /></button>
                                    <button className="p-2 text-gray-400 hover:text-gray-600"><ListIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                        {/* AI Recommendation Widget (New Position) */}
                        <div className="grid lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-3">
                                {/* The Chat/Discovery results will flow here */}
                                <ChatInterface token={token} handleLogout={handleLogout} />
                            </div>

                            <div className="lg:col-span-1 space-y-6">
                                {/* AI Insights Widget */}
                                <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-5 h-5 text-slate-300" />
                                        <span className="font-bold text-sm uppercase tracking-wider">AI Insights</span>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                        Market trends show a 4% increase in residential value in your preferred locations.
                                    </p>
                                    <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/20">
                                        View Report
                                    </button>
                                </div>
                                
                                {/* Quick Stats */}
                                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Recent Searches</h3>
                                    <div className="space-y-4">
                                        {['Luxury Indore', '3 BHK Rau', 'Office Space Vijay Nagar'].map(tag => (
                                            <div key={tag} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">{tag}</span>
                                                <span className="text-blue-600 font-medium">View</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                
                <Footer />
            </div>
        </div>
    );
}
