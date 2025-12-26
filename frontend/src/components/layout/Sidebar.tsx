"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    Home,
    FileText,
    Settings,
    Moon,
    Sun,
    ChevronLeft,
    Menu,
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
];

const settingsItems = [
    {
        title: "Kelola Template",
        href: "/admin/template",
        icon: Settings,
    },
];

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };



    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        }
    }, []);

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
                className={`
          fixed top-0 left-0 z-50 h-full
          bg-[var(--sidebar-bg)] 
          border-r border-[var(--sidebar-border)]
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-0" : "translate-x-0 w-64"}
          lg:relative lg:translate-x-0 overflow-hidden
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

                        {/* Settings Section */}
                        <div className="mt-6">
                            <p className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Pengaturan
                            </p>
                            <ul className="space-y-1 px-3">
                                {settingsItems.map((item) => {
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

                                {/* Dark Mode Toggle */}
                                <li>
                                    <button
                                        onClick={toggleDarkMode}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#323249] hover:text-[#f15a23]
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
                </div>
            </aside>
        </>
    );
}
