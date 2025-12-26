"use client";

import { useState, useCallback } from "react";
import type { Debitur } from "@/types/debitur";

// Mock API base URL - replace with actual API when backend is ready
const API_BASE = "/api";

interface UseDebiturOptions {
    initialData?: Debitur[];
}

interface DebiturFilter {
    q?: string;
    jenis?: string;
    segmentasi?: string;
    kategori?: string;
}

export function useDebitur(options: UseDebiturOptions = {}) {
    const [debiturList, setDebiturList] = useState<Debitur[]>(options.initialData || []);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch all debitur with optional filters
     */
    const fetchDebitur = useCallback(async (filters?: DebiturFilter) => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (filters?.q) params.set("q", filters.q);
            if (filters?.jenis) params.set("jenis", filters.jenis);
            if (filters?.segmentasi) params.set("segmentasi", filters.segmentasi);
            if (filters?.kategori) params.set("kategori", filters.kategori);

            const response = await fetch(`${API_BASE}/debitur?${params.toString()}`);

            if (!response.ok) {
                throw new Error("Failed to fetch debitur");
            }

            const data = await response.json();
            setDebiturList(data.data || []);
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Get single debitur by ID
     */
    const getDebitur = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/debitur/${id}`);

            if (!response.ok) {
                throw new Error("Failed to fetch debitur");
            }

            const data = await response.json();
            return data.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Create new debitur
     */
    const createDebitur = useCallback(async (data: Partial<Debitur>) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/debitur`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to create debitur");
            }

            const result = await response.json();
            return result.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update existing debitur
     */
    const updateDebitur = useCallback(async (id: string, data: Partial<Debitur>) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/debitur/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to update debitur");
            }

            const result = await response.json();
            return result.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Delete debitur
     */
    const deleteDebitur = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/debitur/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete debitur");
            }

            // Remove from local list
            setDebiturList((prev) => prev.filter((d) => d.id !== id));
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Download DOCX for debitur
     */
    const downloadDocx = useCallback(async (id: string) => {
        try {
            const response = await fetch(`${API_BASE}/debitur/${id}/download`);

            if (!response.ok) {
                throw new Error("Failed to download document");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `kredit_${id}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            setError(message);
            return false;
        }
    }, []);

    return {
        debiturList,
        isLoading,
        error,
        fetchDebitur,
        getDebitur,
        createDebitur,
        updateDebitur,
        deleteDebitur,
        downloadDocx,
    };
}
