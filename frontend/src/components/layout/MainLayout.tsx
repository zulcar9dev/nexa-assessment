"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import PreviewModal from "../forms/PreviewModal";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Plus, BarChart3, Settings } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { isSidebarCollapsed, toggleSidebar } = useUIStore();
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--on-surface)] flex">
            {/* Sidebar */}
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col transition-all duration-300 min-h-screen pb-20 md:pb-0 ${!isSidebarCollapsed ? 'lg:ml-64' : ''}`}>
                {/* Header */}
                <Header onMenuClick={toggleSidebar} />

                {/* Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <div className="max-w-[1440px] mx-auto animate-in fade-in duration-300">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-4 px-6 text-center text-sm text-[var(--on-surface-variant)] border-t border-[var(--outline-variant)]/10">
                    © {new Date().getFullYear()} Nexa Gorontalo - Data Assessment
                </footer>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 w-full bg-[var(--surface-light)] border-t border-[var(--outline-variant)]/10 z-40 pb-safe">
                <div className="flex justify-around items-center h-16 px-2">
                    <Link href="/" className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${pathname === '/' ? 'text-primary' : 'text-[var(--on-surface-variant)]'}`}>
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Dashboard</span>
                    </Link>
                    <Link href="/clients" className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${pathname === '/clients' ? 'text-primary' : 'text-[var(--on-surface-variant)]'}`}>
                        <ClipboardList className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Assess</span>
                    </Link>
                    
                    {/* Center FAB */}
                    <div className="relative -top-5">
                        <Link href="/clients/new" className="flex items-center justify-center w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg shadow-primary/30 border-4 border-[var(--background)]">
                            <Plus className="w-6 h-6" />
                        </Link>
                    </div>

                    <Link href="/analytics" className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${pathname === '/analytics' ? 'text-primary' : 'text-[var(--on-surface-variant)]'}`}>
                        <BarChart3 className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Analytics</span>
                    </Link>
                    <Link href="/settings" className={`flex flex-col items-center justify-center w-16 h-full gap-1 ${pathname === '/settings' ? 'text-primary' : 'text-[var(--on-surface-variant)]'}`}>
                        <Settings className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Settings</span>
                    </Link>
                </div>
            </nav>

            {/* Modals */}
            <PreviewModal />
        </div>
    );
}
