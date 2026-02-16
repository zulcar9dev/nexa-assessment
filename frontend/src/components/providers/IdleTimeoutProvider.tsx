"use client";

import { useSession } from "next-auth/react";
import { useIdleTimeout } from "@/hooks/use-idle-timeout";

interface IdleTimeoutProviderProps {
    children: React.ReactNode;
    /** Timeout in minutes (default: 10) */
    timeoutMinutes?: number;
}

/**
 * Provider component that wraps the app and handles idle timeout
 * Will auto-logout user after specified idle time (default: 10 minutes)
 */
export default function IdleTimeoutProvider({
    children,
    timeoutMinutes = 10,
}: IdleTimeoutProviderProps) {
    const { status } = useSession();
    const isAuthenticated = status === "authenticated";

    // Only enable idle timeout when user is authenticated
    useIdleTimeout({
        timeout: timeoutMinutes * 60 * 1000,
        enabled: isAuthenticated,
        onIdle: () => {
            console.log("User idle timeout - logging out...");
        },
    });

    return <>{children}</>;
}
