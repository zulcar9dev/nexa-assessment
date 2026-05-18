"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useUIStore } from "@/stores/ui-store";
import {
    Home,
    FileText,
    Settings,
    Moon,
    Sun,
    ChevronLeft,
} from "lucide-react";

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

const menuItems = [
    {
        title: "Dashboard Input",
        href: "/",
        icon: Home,
    },
    {
        title: "Riwayat Debitur",
        href: "/debitur",
        icon: FileText,
    },
    {
        title: "Pengaturan",
        href: "/settings",
        icon: Settings,
    },
];

const adminItems = [
    {
        title: "Kelola Template",
        href: "/admin/template",
        icon: Settings,
        adminOnly: true,
    },
];

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useUIStore();
    const isDarkMode = theme === "dark";
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { data: session } = useSession();

    // Check if user is admin
    const isAdmin = session?.user?.role?.toLowerCase() === "admin";

    const startTimer = useCallback(() => {
        // Prevent multiple timers
        if (timerRef.current) clearTimeout(timerRef.current);

        // Only auto-hide if currently open
        if (!isCollapsed && onToggle) {
            timerRef.current = setTimeout(() => {
                onToggle();
            }, 5000);
        }
    }, [isCollapsed, onToggle]);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Auto-hide logic: start timer when opened, stop when closed
    useEffect(() => {
        if (!isCollapsed) {
            startTimer();
        } else {
            stopTimer();
        }
        return () => stopTimer();
    }, [isCollapsed, startTimer, stopTimer]);

    return (
        <>
            {/* Mobile Overlay */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside
                onMouseEnter={stopTimer}
                onMouseLeave={startTimer}
                className={`
          fixed top-0 left-0 z-50 h-full lg:h-screen
          bg-[var(--sidebar-bg)] 
          border-r border-[var(--sidebar-border)]
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-0" : "translate-x-0 w-64"}
          lg:sticky lg:top-0 overflow-hidden
        `}
            >
                <div className="flex flex-col h-full w-64">
                    {/* Brand / Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-[#444564]">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#00665e] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">B</span>
                            </div>
                            <span className="font-bold text-lg text-[#00665e] dark:text-[#80cbc4]">
                                Team RBK
                            </span>
                        </Link>
                        <button
                            onClick={onToggle}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249]"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1 px-3">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`
                        relative flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200
                        ${isActive
                                                    ? "bg-[#f15a23]/15 text-[#f15a23] font-semibold"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#323249] hover:text-[#f15a23]"
                                                }
                      `}
                                        >
                                            {isActive && (
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#f15a23] rounded-r-full" />
                                            )}
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Admin Section - Only visible to Admin users */}
                        {isAdmin && (
                            <div className="mt-6">
                                <p className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Admin
                                </p>
                                <ul className="space-y-1 px-3">
                                    {adminItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={`
                              relative flex items-center gap-3 px-4 py-3 rounded-lg
                              transition-all duration-200
                              ${isActive
                                                            ? "bg-[#f15a23]/15 text-[#f15a23] font-semibold"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#323249] hover:text-[#f15a23]"
                                                        }
                            `}
                                                >
                                                    {isActive && (
                                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#f15a23] rounded-r-full" />
                                                    )}
                                                    <item.icon className="w-5 h-5" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* Settings Section */}
                        <div className="mt-6">
                            <p className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Pengaturan
                            </p>
                            <ul className="space-y-1 px-3">
                                {/* Dark Mode Toggle */}
                                <li>
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      text-[#00665e] dark:text-[#80cbc4] hover:bg-gray-100 dark:hover:bg-[#323249] hover:text-[#f15a23]
                      transition-all duration-200"
                                    >
                                        {isDarkMode ? (
                                            <Sun className="w-5 h-5" />
                                        ) : (
                                            <Moon className="w-5 h-5" />
                                        )}
                                        <span>{isDarkMode ? "Mode Terang" : "Mode Gelap"}</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* Version Info */}
                    <div className="px-6 py-4 mt-auto border-t border-gray-200 dark:border-[#444564]">
                        <p className="text-xs text-gray-400 text-center">
                            Versi {process.env.APP_VERSION}
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
