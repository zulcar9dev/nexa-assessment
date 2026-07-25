"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { Segmentasi, JenisPengajuan } from "@/types/clients";

// Stores & Hooks
import { useFormStore } from "@/stores/form-store";
import { useUIStore } from "@/stores/ui-store";
import { useCalculation } from "@/hooks/use-calculation";
import { useClient } from "@/hooks/use-client";

// Components
import FormTabs from "@/components/forms/FormTabs";
import FormActions from "@/components/forms/FormActions";
import DSRCalculator from "@/components/forms/DSRCalculator";

// Tab Components
import TabAIdentitas from "@/components/forms/form-tabs/TabAIdentitas";
import TabBPekerjaan from "@/components/forms/form-tabs/TabBPekerjaan";
import TabBDataPensiun from "@/components/forms/form-tabs/TabBDataPensiun";
import TabCPenghasilan from "@/components/forms/form-tabs/TabCPenghasilan";
import TabCPenghasilanPurna from "@/components/forms/form-tabs/TabCPenghasilanPurna";
import TabDSlik from "@/components/forms/form-tabs/TabDSlik";
import TabEUsulan from "@/components/forms/form-tabs/TabEUsulan";

export default function EditClientPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();

    // Local state
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isPurna, setIsPurna] = useState(false);
    const [category, setCategory] = useState<"type_a" | "type_b" | "type_c">("type_a");
    const [formError, setFormError] = useState<string | null>(null);

    // Store
    const {
        currentTab,
        formData,
        dsrResult,
        isSubmitting,
        setFormData,
        resetForm,
        setCurrentTab
    } = useFormStore();

    const { openPreviewModal } = useUIStore();

    // Hooks
    const { calculateAndUpdateDSR } = useCalculation();
    const { getDebitur, updateDebitur, error: apiError } = useClient();

    // Load data from API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            setLoadError(null);

            const data = await getDebitur(id);

            if (data) {
                // Determine if this is Purna or TypeA based on kategori
                const kategori = String(data.kategori).toLowerCase();
                const isPurnaType = kategori === "purna" || kategori === "type_b";
                const isAktifType = kategori === "aktif" || kategori === "type_c";

                setIsPurna(isPurnaType);
                if (isAktifType) {
                    setCategory("type_c"); // Already a valid literal type
                } else {
                    setCategory(isPurnaType ? "type_b" : "type_a");
                }

                // Load dataLengkap into form store
                if (data.dataLengkap && Object.keys(data.dataLengkap as object).length > 0) {
                     setFormData({
                          ...(data.dataLengkap as Record<string, unknown>),
                         // Ensure critical fields match DB columns
                         nama_pemohon: data.applicantName,
                         no_ktp_pemohon: data.idNumber,
                         segmentasi: String(data.segmentasi).toLowerCase() as Segmentasi,
                         jenis_pengajuan: String(data.jenisPengajuan).toLowerCase() as JenisPengajuan,
                      });
                 } else {
                     // Fallback to basic data
                     setFormData({
                         nama_pemohon: data.applicantName,
                         no_ktp_pemohon: data.idNumber,
                         segmentasi: String(data.segmentasi).toLowerCase() as Segmentasi,
                         jenis_pengajuan: String(data.jenisPengajuan).toLowerCase() as JenisPengajuan,
                     });
                 }
            } else {
                setLoadError(apiError || "Data tidak ditemukan");
            }

            setIsLoadingData(false);
        };

        setCurrentTab("tab-a");
        fetchData();
    }, [id, getDebitur, setFormData, setCurrentTab, apiError]);

    // Effect: Calculate DSR automatically
    useEffect(() => {
        if (!isLoadingData) {
            calculateAndUpdateDSR(category);
        }
    }, [
        formData,
        calculateAndUpdateDSR,
        category,
        isLoadingData
    ]);

    // Handle Save (Update) - Final Submit
    const handleSave = useCallback(async () => {
        setFormError(null);
        // Validate required fields
        if (!formData.nama_pemohon || !formData.no_ktp_pemohon) {
            setFormError("Nama Pemohon dan NIK harus diisi!");
            setCurrentTab("tab-a");
            return;
        }

        // Map values to API format (Enum)
        const mapJenisPengajuan = (val?: string) => {
            if (!val) return undefined;
            const map: Record<string, string> = {
                "baru": "BARU",
                "top_up": "TOP_UP",
                "top_up_sisa_gaji": "TOP_UP_SISA_GAJI",
                "takeover": "TAKEOVER",
            };
            return map[val] || val.toUpperCase();
        };

        const mapSegmentasi = (val?: string) => val ? val.toUpperCase() : undefined;

        const result = await updateDebitur(id, {
            applicantName: formData.nama_pemohon,
            idNumber: formData.no_ktp_pemohon,
            jenisPengajuan: mapJenisPengajuan(formData.jenis_pengajuan),
            segmentasi: mapSegmentasi(formData.segmentasi),
            status: 'SUBMITTED',
            dataLengkap: formData as Record<string, unknown>,
        });

        if (result) {
            // success, no alert needed
            resetForm();
            router.push("/clients");
        } else if (apiError) {
            setFormError(apiError);
        }
    }, [id, formData, updateDebitur, resetForm, router, setCurrentTab, apiError]);

    // Handle Save Draft
    const handleSaveDraft = useCallback(async () => {
        setFormError(null);
        // Validate required fields
        if (!formData.nama_pemohon || !formData.no_ktp_pemohon) {
            setFormError("Nama Pemohon dan NIK harus diisi!");
            setCurrentTab("tab-a");
            return;
        }

        // Map values to API format (Enum)
        const mapJenisPengajuan = (val?: string) => {
            if (!val) return undefined;
            const map: Record<string, string> = {
                "baru": "BARU",
                "top_up": "TOP_UP",
                "top_up_sisa_gaji": "TOP_UP_SISA_GAJI",
                "takeover": "TAKEOVER",
            };
            return map[val] || val.toUpperCase();
        };

        const mapSegmentasi = (val?: string) => val ? val.toUpperCase() : undefined;

        const result = await updateDebitur(id, {
            applicantName: formData.nama_pemohon,
            idNumber: formData.no_ktp_pemohon,
            jenisPengajuan: mapJenisPengajuan(formData.jenis_pengajuan),
            segmentasi: mapSegmentasi(formData.segmentasi),
            status: 'DRAFT',
            dataLengkap: formData as Record<string, unknown>,
        });

        if (result) {
            // success
            resetForm();
            router.push("/clients");
        } else if (apiError) {
            setFormError(apiError);
        }
    }, [id, formData, updateDebitur, resetForm, router, setCurrentTab, apiError]);

    // Handle Cancel
    const handleCancel = () => {
        resetForm();
        router.push("/clients");
    };

    // Render active tab content
    const renderTabContent = () => {
        switch (currentTab) {
            case "tab-a":
                return <TabAIdentitas />;
            case "tab-b":
                return isPurna ? <TabBDataPensiun /> : <TabBPekerjaan kategori={category} />;
            case "tab-c":
                return isPurna ? <TabCPenghasilanPurna /> : <TabCPenghasilan kategori={category} />;
            case "tab-d":
                return <TabDSlik />;
            case "tab-e":
                return <TabEUsulan kategori={category} />;
            default:
                return <TabAIdentitas />;
        }
    };

    // Loading state
    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Memuat data...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (loadError) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-brand dark:text-[#a5b4fc]">
                    Edit Data Client
                </h1>
                <div className="card p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                            {loadError}
                        </p>
                        <Link
                            href="/clients"
                            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark"
                        >
                            Kembali ke Riwayat
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand dark:text-[#a5b4fc]">
                        Edit Data {category === "type_c" ? "Aktif" : isPurna ? "Purna" : "TypeA"}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category === "type_c" ? "Assessment Type C (Active)" : isPurna ? "Assessment Type B (Full-Period)" : "Assessment Type A (Pre-Period)"} &bull; {String(formData.nama_pemohon || formData.nama_lengkap || "Loading...")}
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <div className="relative">
                {/* Form Error */}
                {formError && (
                    <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800 dark:text-red-300">{formError}</p>
                    </div>
                )}
                
                {/* Tab Navigation */}
                <FormTabs kategori={category} />

                {/* Tab Content */}
                <div className="mt-6 animate-in fade-in duration-300">
                    {renderTabContent()}
                </div>
            </div>

            {/* DSR Widget - Only shown in Usulan Tab */}
            {currentTab === "tab-e" && (
                <DSRCalculator
                    dsrValue={dsrResult?.dsr || 0}
                    limit={category === "type_c" ? 60 : 90}
                    penghasilan={dsrResult?.penghasilan || 0}
                    totalAngsuran={dsrResult?.totalAngsuranBaru || 0}
                />
            )}

            {/* Actions */}
            <FormActions
                onSave={handleSave}
                onSaveDraft={handleSaveDraft}
                onPreview={openPreviewModal}
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
                cancelHref=""
            />
        </div>
    );
}
