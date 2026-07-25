"use client";

import { useEffect, useRef, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

interface UseIdleTimeoutOptions {
    /** Timeout in milliseconds (default: 10 minutes) */
    timeout?: number;
    /** Callback to run before logout (optional) */
    onIdle?: () => void;
    /** Whether the hook is enabled (default: true) */
    enabled?: boolean;
}

/**
 * Hook to detect user idle state and auto-logout after specified timeout
 * Default timeout is 10 minutes (600000ms)
 */
export function useIdleTimeout({
    timeout = 10 * 60 * 1000, // 10 minutes in milliseconds
    onIdle,
    enabled = true,
}: UseIdleTimeoutOptions = {}) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    const handleLogout = useCallback(async () => {
        // Call optional onIdle callback
        if (onIdle) {
            onIdle();
        }

        // Sign out using Better Auth
        await authClient.signOut();
        window.location.href = "/login?reason=idle";
    }, [onIdle]);

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            handleLogout();
        }, timeout);
    }, [timeout, handleLogout]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        // Events that indicate user activity
        const activityEvents = [
            "mousedown",
            "mousemove",
            "keydown",
            "scroll",
            "touchstart",
            "click",
            "wheel",
        ];

        // Throttle function to prevent excessive timer resets
        let throttleTimer: NodeJS.Timeout | null = null;
        const throttledResetTimer = () => {
            if (!throttleTimer) {
                resetTimer();
                throttleTimer = setTimeout(() => {
                    throttleTimer = null;
                }, 1000); // Only reset timer once per second max
            }
        };

        // Add event listeners
        activityEvents.forEach((event) => {
            document.addEventListener(event, throttledResetTimer, { passive: true });
        });

        // Handle visibility change (user returns to tab)
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                // Check if timeout has elapsed while tab was hidden
                const elapsed = Date.now() - lastActivityRef.current;
                if (elapsed >= timeout) {
                    handleLogout();
                } else {
                    resetTimer();
                }
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Handle storage event (sync across tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "lastActivity" && e.newValue) {
                lastActivityRef.current = parseInt(e.newValue, 10);
                resetTimer();
            }
        };
        window.addEventListener("storage", handleStorageChange);

        // Update localStorage on activity for cross-tab sync
        const updateStorage = () => {
            try {
                localStorage.setItem("lastActivity", Date.now().toString());
            } catch {
                // localStorage might be unavailable
            }
        };
        const throttledUpdateStorage = () => {
            if (!throttleTimer) {
                updateStorage();
            }
        };
        activityEvents.forEach((event) => {
            document.addEventListener(event, throttledUpdateStorage, { passive: true });
        });

        // Initialize timer
        resetTimer();

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (throttleTimer) {
                clearTimeout(throttleTimer);
            }
            activityEvents.forEach((event) => {
                document.removeEventListener(event, throttledResetTimer);
                document.removeEventListener(event, throttledUpdateStorage);
            });
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [enabled, timeout, resetTimer, handleLogout]);

    return {
        resetTimer,
        lastActivity: lastActivityRef.current,
    };
}
