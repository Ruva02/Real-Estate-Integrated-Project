"use client";

import React from 'react';
import { Home, BookOpen, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar = ({ handleLogout, token }: { handleLogout: () => void, token: string | null }) => {
    const pathname = usePathname();
    const menuItems = [
        { icon: Home, label: 'Dashboard', href: '/' },
        { icon: BookOpen, label: 'Academy', href: '/academy' },
    ];

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-100 flex flex-col p-6 z-[110]">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Home className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">Haven</span>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item, idx) => (
                    <Link
                        key={idx}
                        href={item.href}
                        className={`sidebar-item group ${item.href === pathname ? 'active' : ''}`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {token && (
                <button 
                    onClick={handleLogout}
                    className="sidebar-item text-red-500 hover:bg-red-50"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            )}
        </aside>
    );
};
