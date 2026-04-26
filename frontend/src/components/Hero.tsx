"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, User, ChevronRight, Star } from 'lucide-react';

export const Hero = () => {
    return (
        <section className="w-full max-w-7xl px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-6">
                    <TrendingUp className="w-4 h-4" />
                    Next-Generation Real Estate
                </div>
                <h1 className="text-5xl md:text-7xl font-bold leading-tight serif mb-8">
                    Your Future Home, <br />
                    <span className="text-violet-500 italic">Unpacked by AI.</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
                    Experience an elite concierge service that learns your lifestyle.
                    No more endless searching—just perfectly curated discoveries.
                </p>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => document.getElementById('ai-chat')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 bg-violet-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-violet-500/20 hover:scale-105 transition-transform"
                    >
                        Start Discovery <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4 px-6 py-4 bg-slate-800/50 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center overflow-hidden">
                                    <User className="w-4 h-4 text-slate-400" />
                                </div>
                            ))}
                        </div>
                        <span className="text-sm font-medium text-slate-300">Join 2.4k+ Elite Investors</span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative z-10 group">
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000"
                        alt="Luxury Penthouse"
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    {/* Scanner Effect */}
                    <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[2px] bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.8)] z-20 pointer-events-none"
                    />

                    <div className="absolute bottom-10 left-10 p-6 glass-morphism rounded-2xl border border-white/10 max-w-xs">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-white uppercase tracking-tighter">Live Market Analysis</span>
                        </div>
                        <p className="text-lg font-bold text-white mb-1">Ethereal Heights, Dubai</p>
                        <p className="text-violet-400 font-bold">$4,250,000</p>
                    </div>
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </motion.div>
        </section>
    );
};
