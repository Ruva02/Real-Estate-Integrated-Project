"use client";

import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 py-10 pl-[280px]">
            <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <p className="text-gray-400 text-sm">© 2026 HavenAI. All rights reserved.</p>
                </div>
                
                <div className="flex gap-8 text-sm font-medium text-gray-500">
                    <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
                    <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
                </div>

                <div className="flex gap-4">
                    {[Twitter, Github, Linkedin].map((Icon, i) => (
                        <a key={i} href="#" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Icon className="w-5 h-5" />
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
};
