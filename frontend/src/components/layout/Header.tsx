"use client";

import { Menu, User, LogOut, ChevronDown, Search, Bell, CircleHelp, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useUIStore } from "@/stores/ui-store";

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { data: session } = authClient.useSession();
    const { theme, toggleTheme } = useUIStore();
    const isDarkMode = theme === "dark";
    
    // Avoid hydration mismatch by waiting until mounted
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        // Sign out using Better Auth
        await authClient.signOut();
        window.location.href = "/login";
    };

    // Get user info from session
    const userName = mounted && session?.user?.name ? session.user.name : "Pengguna";
    const userEmail = mounted && session?.user?.email ? session.user.email : "";
    const userRole = mounted && session?.user?.role ? session.user.role : "User";

    // Format role for display
    const formatRole = (role: string) => {
        return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    };

    return (
        <header className="sticky top-0 z-30 bg-[var(--surface-light)]/90 backdrop-blur-md border-b border-[var(--outline-variant)]/20 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Left Side - Menu Toggle & Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors"
                    >
                        <Menu className="w-6 h-6 text-[var(--on-surface-variant)]" />
                    </button>
                    <h1 className="hidden sm:block text-display-lg text-primary font-heading font-extrabold tracking-tight">
                        <span className="hidden md:inline">Nexa Assessment</span>
                        <span className="md:hidden">Nexa</span>
                    </h1>
                </div>

                {/* Right Side - Actions & User Menu */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Search Bar (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center bg-[var(--surface-container-low)] rounded-full px-4 py-2 border border-[var(--outline-variant)]/20 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <Search className="w-4 h-4 text-[var(--on-surface-variant)] mr-2" />
                        <input
                            type="text"
                            placeholder="Cari..."
                            className="bg-transparent border-none focus:outline-none text-sm text-[var(--on-surface)] w-48 placeholder-[var(--on-surface-variant)]/60"
                        />
                    </div>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-[var(--surface-container-high)] transition-colors text-[var(--on-surface-variant)]"
                        title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
                    >
                        {mounted && isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-full hover:bg-[var(--surface-container-high)] transition-colors text-[var(--on-surface-variant)]">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-2 w-2 h-2 bg-danger rounded-full border border-[var(--surface-light)]"></span>
                    </button>

                    {/* Help */}
                    <button className="hidden sm:block p-2 rounded-full hover:bg-[var(--surface-container-high)] transition-colors text-[var(--on-surface-variant)]">
                        <CircleHelp className="w-5 h-5" />
                    </button>

                    {/* Divider */}
                    <div className="w-px h-8 bg-[var(--outline-variant)]/30 mx-1 sm:mx-2 hidden sm:block"></div>

                    {/* User Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors"
                        >
                            {/* Avatar */}
                            <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-primary-container rounded-full flex items-center justify-center border border-[var(--outline-variant)]/20 shadow-sm">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                {/* Online indicator */}
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-success border-2 border-[var(--surface-light)] rounded-full" />
                            </div>
                            <div className="hidden lg:flex flex-col items-start mr-1">
                                <span className="text-sm font-semibold text-[var(--on-surface)]">{userName}</span>
                                <span className="text-xs text-[var(--on-surface-variant)]">{formatRole(userRole)}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-[var(--on-surface-variant)] hidden sm:block transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
                                <div className="absolute right-0 mt-2 w-64 bg-[var(--surface-light)] rounded-xl shadow-lg border border-[var(--outline-variant)]/20 py-2 z-50 animate-in fade-in duration-200">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-[var(--outline-variant)]/10">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 bg-primary-container rounded-full flex items-center justify-center shrink-0">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-heading font-semibold text-[var(--on-surface)] truncate text-sm">
                                                    {userName}
                                                </p>
                                                <p className="text-xs text-[var(--on-surface-variant)] truncate">
                                                    {userEmail}
                                                </p>
                                                <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${userRole.toLowerCase() === 'admin'
                                                        ? 'bg-secondary-container text-[var(--on-surface)]'
                                                        : 'bg-primary-container text-primary'
                                                    }`}>
                                                    {formatRole(userRole)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1 mt-1">
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-danger hover:bg-danger/10 transition-colors text-sm font-medium"
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                handleLogout();
                                            }}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
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
