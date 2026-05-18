"use client";

import { Moon, Sun } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { useSyncExternalStore } from "react";

// Always returns true on client, false on server (avoids hydration mismatch)
const emptySubscribe = () => () => {};
function useMounted() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,  // client
        () => false   // server
    );
}

export default function ThemeToggle() {
    const { theme, toggleTheme } = useUIStore();
    const mounted = useMounted();

    if (!mounted) {
        return (
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249] transition-colors">
                <div className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249] transition-colors"
            title={theme === "light" ? "Mode Gelap" : "Mode Terang"}
        >
            {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-600" />
            ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
            )}
        </button>
    );
}
