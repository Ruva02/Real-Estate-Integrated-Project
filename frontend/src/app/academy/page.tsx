"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { ChatInterface } from '@/components/ChatInterface';
import { BookOpen, GraduationCap, Trophy, Info } from 'lucide-react';

export default function AcademyPage() {
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

    const handleLogout = () => {
        sessionStorage.removeItem('access_token');
        setToken(null);
        window.location.href = '/login';
    };

    if (!mounted || !token) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar token={token} handleLogout={handleLogout} />
            
            <main className="flex-1 ml-64 p-8">
                <Navbar 
                    token={token} 
                    isMenuOpen={false} 
                    setIsMenuOpen={() => {}} 
                    handleLogout={handleLogout} 
                />

                <div className="max-w-6xl mx-auto mt-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <p className="text-slate-500 font-semibold text-sm mb-2 uppercase tracking-wider">Learning Center</p>
                            <h1 className="text-3xl font-bold text-slate-900">Haven Academy</h1>
                            <p className="text-slate-500 mt-1">Master the art of real estate with AI-powered tutoring.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2 shadow-sm">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-bold text-slate-700">120 XP</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3">
                            {/* Special Tutor Chat Interface */}
                            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm h-[700px]">
                                <ChatInterface mode="tutor" token={token} handleLogout={handleLogout} />
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            {/* Course Progress */}
                            <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <GraduationCap className="w-5 h-5 text-indigo-300" />
                                    <span className="font-bold text-sm uppercase tracking-wider">Your Progress</span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>Basics of Investing</span>
                                            <span>80%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="w-4/5 h-full bg-indigo-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>Mortgage Mastery</span>
                                            <span>30%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="w-1/3 h-full bg-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-slate-900">
                                    <Info className="w-5 h-5 text-slate-400" />
                                    <span className="font-bold text-sm">Today's Tip</span>
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed italic">
                                    "Always check the 'Price per Square Foot' when comparing properties in the same neighborhood to find the best relative value."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
