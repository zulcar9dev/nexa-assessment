"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useCallback, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useUIStore } from "@/stores/ui-store";
import {
    Home,
    FileText,
    Settings,
    Moon,
    Sun,
    ChevronLeft,
    BookOpen,
    Upload,
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
        title: "Riwayat Client",
        href: "/clients",
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
    const { data: session } = authClient.useSession();
    // Avoid hydration mismatch by waiting until mounted
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Check if user is admin
    const isAdmin = mounted && session?.user?.role?.toLowerCase() === "admin";

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
          fixed top-0 left-0 z-50 h-full lg:h-screen
          bg-[var(--sidebar-bg)] 
          border-r border-[var(--sidebar-border)]
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-0 lg:min-w-0 lg:border-r-0" : "translate-x-0 w-64"}
          lg:sticky lg:top-0 overflow-hidden
        `}
            >
                <div className="flex flex-col h-full w-64">
                    {/* Brand / Logo */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">N</span>
                            </div>
                            <span className="font-bold text-lg text-brand dark:text-[#a5b4fc]">
                                Team RBK
                            </span>
                        </Link>
                        <button
                            onClick={onToggle}
                            className="lg:hidden p-2 rounded-lg hover:bg-muted"
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
                                                    ? "bg-accent/15 text-accent font-semibold"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-muted hover:text-accent"
                                                }
                      `}
                                        >
                                            {isActive && (
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
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
                                                            ? "bg-accent/15 text-accent font-semibold"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-muted hover:text-accent"
                                                        }
                            `}
                                                >
                                                    {isActive && (
                                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
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

                        {/* Knowledge Base Section */}
                        <div className="mt-6">
                            <p className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Knowledge Base
                            </p>
                            <ul className="space-y-1 px-3">
                                {[
                                    { title: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
                                    { title: "Upload Dokumen", href: "/knowledge-base/upload", icon: Upload },
                                ].map((item) => {
                                    const isActive = pathname === item.href || (item.href === "/knowledge-base" && pathname.startsWith("/knowledge-base") && pathname !== "/knowledge-base/upload");
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={`
                              relative flex items-center gap-3 px-4 py-3 rounded-lg
                              transition-all duration-200
                              ${isActive
                                                        ? "bg-accent/15 text-accent font-semibold"
                                                        : "text-gray-700 dark:text-gray-300 hover:bg-muted hover:text-accent"
                                                    }
                            `}
                                            >
                                                {isActive && (
                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
                                                )}
                                                <item.icon className="w-5 h-5" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

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
                      text-brand dark:text-[#a5b4fc] hover:bg-muted hover:text-accent
                      transition-all duration-200"
                                    >
                                        {mounted && isDarkMode ? (
                                            <Sun className="w-5 h-5" />
                                        ) : (
                                            <Moon className="w-5 h-5" />
                                        )}
                                        <span>{mounted && isDarkMode ? "Mode Terang" : "Mode Gelap"}</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* Version Info */}
                    <div className="px-6 py-4 mt-auto border-t border-border">
                        <p className="text-xs text-gray-400 text-center">
                            Versi {process.env.APP_VERSION}
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
