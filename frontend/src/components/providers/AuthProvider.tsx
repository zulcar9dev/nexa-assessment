"use client";

import { SessionProvider } from "next-auth/react";
import IdleTimeoutProvider from "./IdleTimeoutProvider";

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <IdleTimeoutProvider timeoutMinutes={10}>
                {children}
            </IdleTimeoutProvider>
        </SessionProvider>
    );
}
