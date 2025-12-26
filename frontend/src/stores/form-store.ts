import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DebiturFormData, DSRResult } from "@/types/debitur";

interface FormStore {
    // Form data
    formData: Partial<DebiturFormData>;

    // UI state
    currentTab: string;
    isDirty: boolean;
    isSubmitting: boolean;

    // DSR calculation
    dsrResult: DSRResult | null;

    // Actions
    setFormData: (data: Partial<DebiturFormData>) => void;
    updateField: (field: string, value: string) => void;
    setCurrentTab: (tab: string) => void;
    setDsrResult: (result: DSRResult | null) => void;
    setIsSubmitting: (isSubmitting: boolean) => void;
    resetForm: () => void;
    loadDraft: () => void;
    saveDraft: () => void;
}

const initialFormData: Partial<DebiturFormData> = {
    segmentasi: "taspen",
    jenis_pengajuan: "baru",
    fasilitas_nihil: "tidak",
};

export const useFormStore = create<FormStore>()(
    persist(
        (set, get) => ({
            // Initial state
            formData: initialFormData,
            currentTab: "tab-a",
            isDirty: false,
            isSubmitting: false,
            dsrResult: null,

            // Actions
            setFormData: (data) =>
                set((state) => ({
                    formData: { ...state.formData, ...data },
                    isDirty: true,
                })),

            updateField: (field, value) =>
                set((state) => ({
                    formData: { ...state.formData, [field]: value },
                    isDirty: true,
                })),

            setCurrentTab: (tab) => set({ currentTab: tab }),

            setDsrResult: (result) => set({ dsrResult: result }),

            setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

            resetForm: () =>
                set({
                    formData: initialFormData,
                    currentTab: "tab-a",
                    isDirty: false,
                    isSubmitting: false,
                    dsrResult: null,
                }),

            loadDraft: () => {
                // Draft is automatically loaded by persist middleware
                console.log("Draft loaded from localStorage");
            },

            saveDraft: () => {
                // Draft is automatically saved by persist middleware
                console.log("Draft saved to localStorage");
            },
        }),
        {
            name: "debitur-form-draft",
            partialize: (state) => ({
                formData: state.formData,
                currentTab: state.currentTab,
            }),
        }
    )
);
