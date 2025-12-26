"use client";

import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = () => {
        // Clear auth cookie
        document.cookie = "auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // Redirect to login
        window.location.href = "/login";
    };

    return (
        <header className="sticky top-0 z-30 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)] shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Left Side - Menu Toggle */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249] transition-colors"
                    >
                        <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Right Side - User Menu */}
                <div className="flex items-center gap-4">
                    {/* User Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249] transition-colors"
                        >
                            {/* Avatar */}
                            <div className="relative w-10 h-10 bg-[#e0f2f1] dark:bg-[#00665e]/30 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-[#00665e] dark:text-[#80cbc4]" />
                                {/* Online indicator */}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#2b2c40] rounded-full" />
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsDropdownOpen(false)}
                                />

                                {/* Dropdown */}
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#2b2c40] rounded-lg shadow-lg border border-gray-200 dark:border-[#444564] py-2 z-50 animate-fade-in">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-200 dark:border-[#444564]">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 bg-[#e0f2f1] dark:bg-[#00665e]/30 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-[#00665e] dark:text-[#80cbc4]" />
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#2b2c40] rounded-full" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                    Petugas Bank
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Admin
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                handleLogout();
                                            }}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Log Out</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
