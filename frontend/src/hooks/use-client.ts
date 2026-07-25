"use client";

import { useState, useCallback } from "react";
import type { Client } from "@/types/clients";

import type { ApiResponse, PaginatedResponse } from "@/types/api";

interface UseClientOptions {
    initialData?: Client[];
}

interface DebiturFilter {
    q?: string;
    jenis?: string;
    segmentasi?: string;
    kategori?: string;
    status?: string;
    page?: number;
    limit?: number;
}

interface CreateClientData {
    applicantName: string;
    idNumber: string;
    kategori: string;
    jenisPengajuan: string;
    segmentasi: string;
    dataLengkap: Record<string, unknown>;
    status?: string;
}

export function useClient(options: UseClientOptions = {}) {
    const [debiturList, setDebiturList] = useState<Client[]>(options.initialData || []);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([]);

    /**
     * Clear errors
     */
    const clearErrors = useCallback(() => {
        setError(null);
        setValidationErrors([]);
    }, []);

    /**
     * Fetch all client with optional filters
     */
    const fetchDebitur = useCallback(async (filters?: DebiturFilter) => {
        setIsLoading(true);
        clearErrors();

        try {
            const params = new URLSearchParams();
            if (filters?.q) params.set("q", filters.q);
            if (filters?.jenis) params.set("jenis", filters.jenis);
            if (filters?.segmentasi) params.set("segmentasi", filters.segmentasi);
            if (filters?.kategori) params.set("kategori", filters.kategori);
            if (filters?.status) params.set("status", filters.status);
            if (filters?.page) params.set("page", filters.page.toString());
            if (filters?.limit) params.set("limit", filters.limit.toString());

            const response = await fetch(`/api/clients?${params.toString()}`);
            const result: ApiResponse<PaginatedResponse<Client>> = await response.json();

            if (!result.success) {
                throw new Error(result.error?.message || "Gagal mengambil data client");
            }

            if (result.data) {
                setDebiturList(result.data.data || []);
                setPagination(result.data.meta);
            }

            return result.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [clearErrors]);

    /**
     * Get single client by ID
     */
    const getDebitur = useCallback(async (id: string) => {
        setIsLoading(true);
        clearErrors();

        try {
            const response = await fetch(`/api/clients/${id}`);
            const result: ApiResponse<Client> = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
                }
                if (response.status === 403) {
                    throw new Error("Anda tidak memiliki akses ke data ini.");
                }
                if (response.status === 404) {
                    throw new Error("Data client tidak ditemukan.");
                }
                throw new Error(result.error?.message || "Gagal mengambil data client");
            }

            return result.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [clearErrors]);

    /**
     * Create new client
     */
    const createDebitur = useCallback(async (data: CreateClientData) => {
        setIsLoading(true);
        clearErrors();

        try {
            const response = await fetch("/api/clients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result: ApiResponse<Client> = await response.json();

            if (!response.ok) {
                if (response.status === 400 && result.error?.details) {
                    setValidationErrors(result.error.details);
                }
                if (response.status === 401) {
                    throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
                }
                throw new Error(result.error?.message || "Gagal menyimpan data client");
            }

            return result.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [clearErrors]);

    /**
     * Update existing client
     */
    const updateDebitur = useCallback(async (id: string, data: Partial<CreateClientData>) => {
        setIsLoading(true);
        clearErrors();

        try {
            const response = await fetch(`/api/clients/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result: ApiResponse<Client> = await response.json();

            if (!response.ok) {
                if (response.status === 400 && result.error?.details) {
                    setValidationErrors(result.error.details);
                }
                if (response.status === 401) {
                    throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
                }
                if (response.status === 403) {
                    throw new Error("Anda tidak memiliki akses untuk mengubah data ini.");
                }
                if (response.status === 404) {
                    throw new Error("Data client tidak ditemukan.");
                }
                throw new Error(result.error?.message || "Gagal memperbarui data client");
            }

            return result.data;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [clearErrors]);

    /**
     * Delete client
     */
    const deleteDebitur = useCallback(async (id: string) => {
        setIsLoading(true);
        clearErrors();

        try {
            const response = await fetch(`/api/clients/${id}`, {
                method: "DELETE",
            });

            const result: ApiResponse = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
                }
                if (response.status === 403) {
                    throw new Error("Anda tidak memiliki akses untuk menghapus data ini.");
                }
                if (response.status === 404) {
                    throw new Error("Data client tidak ditemukan.");
                }
                throw new Error(result.error?.message || "Gagal menghapus data client");
            }

            // Remove from local list
            setDebiturList((prev) => prev.filter((d) => d.id !== id));
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [clearErrors]);

    /**
     * Download DOCX for client
     */
    const downloadDocx = useCallback(async (id: string, namaDebitur?: string) => {
        setIsLoading(true);
        clearErrors();

        try {
            const response = await fetch(`/api/clients/${id}/download`);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
                }
                if (response.status === 403) {
                    throw new Error("Anda tidak memiliki akses ke dokumen ini.");
                }
                if (response.status === 404) {
                    throw new Error("Data client tidak ditemukan.");
                }
                throw new Error("Gagal mengunduh dokumen");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            // Get filename from Content-Disposition header or generate one
            const contentDisposition = response.headers.get("Content-Disposition");
            let filename = `Kredit_${namaDebitur || id}.docx`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Terjadi kesalahan";
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [clearErrors]);

    return {
        // Data
        debiturList,
        pagination,

        // State
        isLoading,
        error,
        validationErrors,

        // Actions
        fetchDebitur,
        getDebitur,
        createDebitur,
        updateDebitur,
        deleteDebitur,
        downloadDocx,
        clearErrors,
    };
}
