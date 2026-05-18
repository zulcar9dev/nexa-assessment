"use client";

import { useState, useCallback } from "react";
import type { DocumentData } from "@/components/knowledge-base/DocumentCard";

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface FetchParams {
    q?: string;
    kategori?: string;
    targetMarket?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export function useKnowledgeBase() {
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(null);
    const [versions, setVersions] = useState<DocumentData[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = useCallback(async (params?: FetchParams) => {
        setIsLoading(true);
        setError(null);
        try {
            const searchParams = new URLSearchParams();
            if (params?.q) searchParams.set("q", params.q);
            if (params?.kategori) searchParams.set("kategori", params.kategori);
            if (params?.targetMarket) searchParams.set("targetMarket", params.targetMarket);
            if (params?.status) searchParams.set("status", params.status);
            if (params?.startDate) searchParams.set("startDate", params.startDate);
            if (params?.endDate) searchParams.set("endDate", params.endDate);
            searchParams.set("page", String(params?.page || 1));
            searchParams.set("limit", String(params?.limit || 12));

            const res = await fetch(`/api/knowledge-base?${searchParams.toString()}`);
            if (!res.ok) throw new Error("Gagal memuat dokumen");

            const json = await res.json();
            const data = json.data || {};
            setDocuments(data.documents || []);
            setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchDocument = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/knowledge-base/${id}`);
            if (!res.ok) throw new Error("Dokumen tidak ditemukan");

            const json = await res.json();
            const data = json.data || {};
            setCurrentDocument(data.document || null);
            setVersions(data.versions || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const uploadDocument = useCallback(async (formData: FormData): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/knowledge-base", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error?.message || "Gagal mengunggah dokumen");
            }
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateDocument = useCallback(async (id: string, data: Partial<DocumentData>): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/knowledge-base/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Gagal memperbarui dokumen");
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/knowledge-base/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Gagal menghapus dokumen");
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan");
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const downloadDocument = useCallback(async (id: string, filename: string) => {
        try {
            const res = await fetch(`/api/knowledge-base/${id}/file`);
            if (!res.ok) throw new Error("Gagal mengunduh file");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal mengunduh file");
        }
    }, []);

    const clearErrors = useCallback(() => setError(null), []);

    return {
        documents,
        currentDocument,
        versions,
        pagination,
        isLoading,
        error,
        fetchDocuments,
        fetchDocument,
        uploadDocument,
        updateDocument,
        deleteDocument,
        downloadDocument,
        clearErrors,
    };
}
