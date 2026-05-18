"use client";

import { useState, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (type: ToastType, message: string, duration = 5000) => {
            const id = Math.random().toString(36).substring(2, 9);
            const toast: Toast = { id, type, message, duration };

            setToasts((prev) => [...prev, toast]);

            // Auto remove after duration
            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }

            return id;
        },
        [removeToast]
    );

    const success = useCallback(
        (message: string, duration?: number) => addToast("success", message, duration),
        [addToast]
    );

    const error = useCallback(
        (message: string, duration?: number) => addToast("error", message, duration),
        [addToast]
    );

    const warning = useCallback(
        (message: string, duration?: number) => addToast("warning", message, duration),
        [addToast]
    );

    const info = useCallback(
        (message: string, duration?: number) => addToast("info", message, duration),
        [addToast]
    );

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
    };
}
