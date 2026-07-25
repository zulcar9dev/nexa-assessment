"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import IdleTimeoutProvider from "./IdleTimeoutProvider";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        // If session is loaded and is null, and the user is NOT on the login page,
        // clear any invalid session cookies and redirect to login page.
        if (!isPending && !session && typeof window !== "undefined" && window.location.pathname !== "/login") {
            authClient.signOut().then(() => {
                window.location.href = "/login?reason=session_expired";
            });
        }
    }, [session, isPending]);

    return (
        <IdleTimeoutProvider timeoutMinutes={10}>
            {children}
        </IdleTimeoutProvider>
    );
}

