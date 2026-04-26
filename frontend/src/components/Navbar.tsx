"use client";

import React from 'react';
import Link from 'next/link';
import { Search, Bell, User as UserIcon } from 'lucide-react';

interface NavbarProps {
    token: string | null;
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
    handleLogout: () => void;
}

export const Navbar = ({ token }: NavbarProps) => {
    return (
        <header className="h-20 border-b border-gray-100 bg-white sticky top-0 z-[100] flex items-center justify-between px-10 w-full pl-[280px]">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search properties, locations..." 
                        className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                {token ? (
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900">Member</p>
                            <p className="text-xs text-gray-400">Pro Account</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                            <UserIcon className="w-5 h-5" />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</Link>
                        <Link href="/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Get Started</Link>
                    </div>
                )}
            </div>
        </header>
    );
};
