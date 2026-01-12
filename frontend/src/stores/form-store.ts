import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DebiturFormData, DSRResult } from "@/types/debitur";

// API Response type
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

interface FormStore {
  // Form data
  formData: Partial<DebiturFormData>;

  // UI state
  currentTab: string;
  isDirty: boolean;
  isSubmitting: boolean;

  // DSR calculation
  dsrResult: DSRResult | null;

  // Submit state
  submitError: string | null;
  validationErrors: Array<{ field: string; message: string }>;

  // Actions
  setFormData: (data: Partial<DebiturFormData>) => void;
  updateField: (field: string, value: string | boolean | number | null) => void;
  batchUpdateFields: (fields: Partial<DebiturFormData>) => void;
  setCurrentTab: (tab: string) => void;
  setDsrResult: (result: DSRResult | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setSubmitError: (error: string | null) => void;
  setValidationErrors: (
    errors: Array<{ field: string; message: string }>
  ) => void;
  resetForm: () => void;
  loadDraft: () => void;
  saveDraft: () => void;
  clearErrors: () => void;

  // API actions
  submitForm: (
    kategori: "prapurna" | "purna" | "aktif",
    isPurna: boolean
  ) => Promise<{ success: boolean; id?: string }>;
}

const initialFormData: Partial<DebiturFormData> = {
  segmentasi: "taspen",
  jenis_pengajuan: "baru",
  fasilitas_nihil: "tidak",
};

// Helper function to determine kategori based on form data and jenis pengajuan
// Mapping sesuai struktur:
// 1. Prapurna: Baru, Top Up, Top Up Sisa Gaji, THT, Take Over
// 2. Purna: Baru, Top Up, Top Up Sisa Gaji, Take Over
// 3. Aktif: Baru, Top Up, Take Over
function getKategori(
  kategori: "prapurna" | "purna" | "aktif",
  jenisPengajuan?: string
): string {
  // Explicit mapping for each kategori and jenis_pengajuan combination
  const mappingTable: Record<string, Record<string, string>> = {
    // 1. Prapurna
    prapurna: {
      baru: "prapurna_baru",
      top_up: "prapurna_top_up",
      top_up_sisa_gaji: "prapurna_top_up_sisa_gaji",
      tht: "prapurna_tht",
      takeover: "prapurna_takeover",
    },
    // 2. Purna
    purna: {
      baru: "purna_baru",
      top_up: "purna_top_up",
      top_up_sisa_gaji: "purna_top_up_sisa_gaji",
      takeover: "purna_takeover",
    },
    // 3. Aktif
    aktif: {
      baru: "aktif_baru",
      top_up: "aktif_top_up",
      takeover: "aktif_takeover",
    },
  };

  const jenis = jenisPengajuan || "baru";
  return mappingTable[kategori]?.[jenis] || "prapurna_baru";
}

// Helper function to map jenis pengajuan to API enum (lowercase)
// Valid values: baru, top_up, top_up_sisa_gaji, tht, takeover, fleksi_aktif
function mapJenisPengajuan(jenis?: string): string {
  const validOptions = [
    "baru",
    "top_up",
    "top_up_sisa_gaji",
    "tht",
    "takeover",
    "fleksi_aktif",
  ];
  const value = (jenis || "baru").toLowerCase();
  return validOptions.includes(value) ? value : "baru";
}

// Helper function to map segmentasi to API enum (lowercase)
// Valid values: taspen, asabri
function mapSegmentasi(segmentasi?: string): string {
  const value = (segmentasi || "taspen").toLowerCase();
  return value === "asabri" ? "asabri" : "taspen";
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      // Initial state
      formData: initialFormData,
      currentTab: "tab-a",
      isDirty: false,
      isSubmitting: false,
      dsrResult: null,
      submitError: null,
      validationErrors: [],

      // Actions
      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          isDirty: true,
        })),

      updateField: (field: string, value: string | boolean | number | null) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
          isDirty: true,
        })),

      batchUpdateFields: (fields: Partial<DebiturFormData>) =>
        set((state) => ({
          formData: { ...state.formData, ...fields },
          isDirty: true,
        })),

      setCurrentTab: (tab) => set({ currentTab: tab }),

      setDsrResult: (result) => set({ dsrResult: result }),

      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

      setSubmitError: (error) => set({ submitError: error }),

      setValidationErrors: (errors) => set({ validationErrors: errors }),

      clearErrors: () => set({ submitError: null, validationErrors: [] }),

      resetForm: () =>
        set({
          formData: initialFormData,
          currentTab: "tab-a",
          isDirty: false,
          isSubmitting: false,
          dsrResult: null,
          submitError: null,
          validationErrors: [],
        }),

      loadDraft: () => {
        // Draft is automatically loaded by persist middleware
        console.log("Draft loaded from localStorage");
      },

      saveDraft: () => {
        // Draft is automatically saved by persist middleware
        console.log("Draft saved to localStorage");
      },

      // API Submit
      submitForm: async (kategori, isPurna) => {
        const { formData } = get();

        set({
          isSubmitting: true,
          submitError: null,
          validationErrors: [],
        });

        try {
          // Prepare request data
          const requestData = {
            namaPemohon: formData.nama_pemohon || "",
            noKtp: formData.no_ktp_pemohon || "",
            kategori: getKategori(kategori, formData.jenis_pengajuan),
            jenisPengajuan: mapJenisPengajuan(formData.jenis_pengajuan),
            segmentasi: mapSegmentasi(formData.segmentasi),
            dataLengkap: formData,
          };

          const response = await fetch("/api/debitur", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          });

          const result: ApiResponse<{ id: string }> = await response.json();

          if (!response.ok) {
            if (response.status === 400 && result.error?.details) {
              set({ validationErrors: result.error.details });
            }
            if (response.status === 401) {
              window.location.href =
                "/login?callbackUrl=" +
                encodeURIComponent(window.location.pathname);
              return { success: false };
            }
            set({
              submitError: result.error?.message || "Gagal menyimpan data",
            });
            return { success: false };
          }

          // Success - reset form and return ID
          set({
            formData: initialFormData,
            isDirty: false,
            dsrResult: null,
          });

          return {
            success: true,
            id: result.data?.id,
          };
        } catch (error) {
          console.error("Submit form error:", error);
          set({ submitError: "Terjadi kesalahan. Silakan coba lagi." });
          return { success: false };
        } finally {
          set({ isSubmitting: false });
        }
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
