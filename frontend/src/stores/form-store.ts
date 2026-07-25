import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DebiturFormData, DSRResult } from "@/types/clients";

import type { ApiResponse } from "@/types/api";

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
  clearErrors: () => void;

  // API actions
  submitForm: (
    kategori: "type_a" | "type_b" | "type_c",
    status?: "DRAFT" | "SUBMITTED"
  ) => Promise<{ success: boolean; id?: string }>;
}

const initialFormData: Partial<DebiturFormData> = {
  jenis_pengajuan: "baru",
  fasilitas_nihil: "tidak",
};

// Helper function to determine kategori based on form data and jenis pengajuan
// Mapping sesuai struktur:
// 1. TypeA: Baru, Top Up, Top Up Sisa Gaji, THT, Take Over
// 2. Purna: Baru, Top Up, Top Up Sisa Gaji, Take Over
// 3. Aktif: Baru, Top Up, Take Over
function getKategori(
  kategori: "type_a" | "type_b" | "type_c",
  jenisPengajuan?: string
): string {
  // Explicit mapping for each kategori and jenis_pengajuan combination
  const mappingTable: Record<string, Record<string, string>> = {
    // 1. TypeA
    type_a: {
      baru: "type_a_baru",
      top_up: "type_a_top_up",
      top_up_sisa_gaji: "type_a_top_up_sisa_gaji",
      tht: "type_a_tht",
      takeover: "type_a_takeover",
    },
    // 2. Purna
    type_b: {
      baru: "type_b_baru",
      top_up: "type_b_top_up",
      top_up_sisa_gaji: "type_b_top_up_sisa_gaji",
      takeover: "type_b_takeover",
      pensiunan_janda_baru: "type_b_baru",
      pensiunan_janda_top_up: "type_b_top_up",
      pensiunan_janda_takeover: "type_b_takeover",
      pensiunan_duda_baru: "type_b_baru",
      pensiunan_duda_top_up: "type_b_top_up",
      pensiunan_duda_takeover: "type_b_takeover",
    },
    // 3. Aktif
    type_c: {
      baru: "type_c_baru",
      top_up: "type_c_top_up",
      takeover: "type_c_takeover",
    },
  };

  const jenis = jenisPengajuan || "baru";
  return mappingTable[kategori]?.[jenis] || "type_a_baru";
}

// Helper function to map jenis pengajuan to API enum (lowercase)
// Valid values: baru, top_up, top_up_sisa_gaji, tht, takeover, fleksi_type_c
function mapJenisPengajuan(jenis?: string): string {
  const validOptions = [
    "baru",
    "top_up",
    "top_up_sisa_gaji",
    "tht",
    "takeover",
    "fleksi_type_c",
    "pensiunan_janda_baru",
    "pensiunan_janda_top_up",
    "pensiunan_janda_takeover",
    "pensiunan_duda_baru",
    "pensiunan_duda_top_up",
    "pensiunan_duda_takeover",
  ];
  const value = (jenis || "baru").toLowerCase();
  return validOptions.includes(value) ? value : "baru";
}

// Helper function to map segmentasi to API enum (lowercase)
// Valid values: taspen, asabri, bumd_bumn, swasta, pemerintahan
function mapSegmentasi(segmentasi?: string): string {
  const validOptions = ["taspen", "asabri", "bumd_bumn", "swasta", "pemerintahan"];
  const value = (segmentasi || "taspen").toLowerCase();
  return validOptions.includes(value) ? value : "taspen";
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



      // API Submit
      submitForm: async (kategori, status = "SUBMITTED") => {
        const { formData } = get();

        set({
          isSubmitting: true,
          submitError: null,
          validationErrors: [],
        });

        try {
          // Prepare request data
          const requestData = {
            applicantName: formData.nama_pemohon || "",
            idNumber: formData.no_ktp_pemohon || "",
            kategori: getKategori(kategori, formData.jenis_pengajuan),
            jenisPengajuan: mapJenisPengajuan(formData.jenis_pengajuan),
            segmentasi: mapSegmentasi(formData.segmentasi),
            dataLengkap: formData,
            status,
          };

          const response = await fetch("/api/clients", {
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
            if (response.status === 409) {
              set({
                submitError: result.error?.message || "Data client dengan No. KTP dan Jenis Pengajuan yang sama sudah ada.",
              });
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
      name: "client-form-draft",
      partialize: (state) => ({
        formData: state.formData,
        currentTab: state.currentTab,
      }),
    }
  )
);
