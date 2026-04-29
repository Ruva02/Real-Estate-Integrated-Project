"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, Mail, Lock, ArrowRight, Loader, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5016` : 'http://localhost:5016');

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('access_token', data.access_token);
                sessionStorage.setItem('refresh_token', data.refresh_token);
                window.location.href = '/';
            } else {
                setError(data.error || "Invalid credentials");
            }
        } catch (error) {
            setError("Cannot connect to server. Ensure backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Left Side: Illustration/Text */}
            <div className="hidden md:flex md:w-1/2 bg-blue-600 p-16 flex-col justify-between text-white relative">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                        <Home className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight">Haven</span>
                </Link>

                <div className="max-w-md">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Simplify your property search.</h1>
                    <p className="text-blue-100 text-lg leading-relaxed">
                        Access AI-powered insights, real-time market data, and a curated list of elite properties in one clean dashboard.
                    </p>
                </div>

                <div className="flex items-center gap-4 text-blue-200 text-sm">
                    <span>© 2026 HavenAI</span>
                    <span className="w-1 h-1 bg-blue-300 rounded-full" />
                    <span>SaaS Real Estate Platform</span>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-sm"
                >
                    <div className="mb-10 md:hidden">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                            <Home className="text-white w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                    </div>

                    <div className="mb-10 hidden md:block">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Sign In</h2>
                        <p className="text-gray-500">Enter your credentials to access the platform.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <Link href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 mt-8"
                        >
                            {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <p className="text-center mt-10 text-gray-500 text-sm">
                        Don&apos;t have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline">Create Account</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
