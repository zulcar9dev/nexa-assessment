"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useUIStore } from "@/stores/ui-store";
import {
    LayoutDashboard,
    ClipboardList,
    Settings,
    Moon,
    Sun,
    ChevronLeft,
    BookOpen,
    Upload,
    Hexagon,
    HelpCircle,
    LogOut
} from "lucide-react";

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

const menuItems = [
    {
        title: "Dashboard Input",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Riwayat Client",
        href: "/clients",
        icon: ClipboardList,
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await authClient.signOut();
        window.location.href = "/login";
    };

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
          bg-[var(--surface-light)] 
          border-r border-[var(--outline-variant)]/20 shadow-sm
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-0 lg:min-w-0 lg:border-r-0 lg:opacity-0 lg:pointer-events-none" : "translate-x-0 w-64"}
          lg:fixed lg:top-0 overflow-hidden flex flex-col
        `}
            >
                {/* Brand Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-[var(--outline-variant)]/20 shrink-0">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                            <Hexagon className="w-6 h-6 text-on-primary fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading font-extrabold text-[var(--on-surface)] leading-tight text-lg">
                                Nexa Enterprise
                            </span>
                            <span className="text-[10px] text-[var(--on-surface-variant)] font-bold uppercase tracking-widest">
                                INNOVATION & TRUST
                            </span>
                        </div>
                    </Link>
                    <button
                        onClick={onToggle}
                        className="lg:hidden p-2 rounded-lg hover:bg-[var(--surface-container-high)]"
                    >
                        <ChevronLeft className="w-5 h-5 text-[var(--on-surface-variant)]" />
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
                                                ? "bg-primary/10 text-primary border-l-4 border-primary font-semibold"
                                                : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)] border-l-4 border-transparent"
                                            }
                                        `}
                                    >
                                        <item.icon className="w-5 h-5 shrink-0" />
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Admin Section - Only visible to Admin users */}
                    {isAdmin && (
                        <div className="mt-6">
                            <p className="px-6 py-2 text-label-caps text-[var(--on-surface-variant)]/70 uppercase tracking-wider">
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
                                                        ? "bg-primary/10 text-primary border-l-4 border-primary font-semibold"
                                                        : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)] border-l-4 border-transparent"
                                                    }
                                                `}
                                            >
                                                <item.icon className="w-5 h-5 shrink-0" />
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
                        <p className="px-6 py-2 text-label-caps text-[var(--on-surface-variant)]/70 uppercase tracking-wider">
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
                                                    ? "bg-primary/10 text-primary border-l-4 border-primary font-semibold"
                                                    : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)] border-l-4 border-transparent"
                                                }
                                            `}
                                        >
                                            <item.icon className="w-5 h-5 shrink-0" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Settings Section */}
                    <div className="mt-6">
                        <p className="px-6 py-2 text-label-caps text-[var(--on-surface-variant)]/70 uppercase tracking-wider">
                            Pengaturan
                        </p>
                        <ul className="space-y-1 px-3">
                            {/* Dark Mode Toggle */}
                            <li>
                                <button
                                    onClick={toggleTheme}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                    text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)] border-l-4 border-transparent
                                    transition-all duration-200"
                                >
                                    {mounted && isDarkMode ? (
                                        <Sun className="w-5 h-5 shrink-0" />
                                    ) : (
                                        <Moon className="w-5 h-5 shrink-0" />
                                    )}
                                    <span>{mounted && isDarkMode ? "Mode Terang" : "Mode Gelap"}</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* Footer Actions */}
                <div className="px-3 py-4 border-t border-[var(--outline-variant)]/20 shrink-0 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)] transition-all duration-200">
                        <HelpCircle className="w-5 h-5 shrink-0" />
                        <span>Support</span>
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-danger hover:bg-danger/10 transition-all duration-200">
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span>Logout</span>
                    </button>
                </div>

                {/* Version Info */}
                <div className="px-6 pb-4 shrink-0">
                    <p className="text-xs text-[var(--on-surface-variant)]/70 text-center">
                        Versi {process.env.APP_VERSION || '1.0.0'}
                    </p>
                </div>
            </aside>
        </>
    );
}
