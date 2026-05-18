"use client";


import Sidebar from "./Sidebar";
import Header from "./Header";
import PreviewModal from "../forms/PreviewModal";

import { useUIStore } from "@/stores/ui-store";

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { isSidebarCollapsed, toggleSidebar } = useUIStore();

    return (
        <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
            {/* Sidebar */}
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <Header onMenuClick={toggleSidebar} />

                {/* Content */}
                <main className="flex-1 p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-[#444564]">
                    © {new Date().getFullYear()} BNI Gorontalo - Kredit Konsumer
                </footer>
            </div>

            {/* Modals */}
            <PreviewModal />
        </div>
    );
}
