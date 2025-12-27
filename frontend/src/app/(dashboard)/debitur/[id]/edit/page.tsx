"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

// Stores & Hooks
import { useFormStore } from "@/stores/form-store";
import { useUIStore } from "@/stores/ui-store";
import { useCalculation } from "@/hooks/use-calculation";
import { useDebitur } from "@/hooks/use-debitur";

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

export default function EditDebiturPage({
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
    const [category, setCategory] = useState<"prapurna" | "purna">("prapurna");

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
    const { getDebitur, updateDebitur, error: apiError } = useDebitur();

    // Load data from API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            setLoadError(null);

            const data = await getDebitur(id);

            if (data) {
                // Determine if this is Purna or Prapurna based on kategori
                const kategori = String(data.kategori).toLowerCase();
                const isPurnaType = kategori.includes("purna") && !kategori.includes("prapurna");
                setIsPurna(isPurnaType);
                setCategory(isPurnaType ? "purna" : "prapurna");

                // Load dataLengkap into form store
                if (data.dataLengkap) {
                    setFormData(data.dataLengkap);
                } else {
                    // Fallback to basic data
                    setFormData({
                        nama_pemohon: data.namaPemohon,
                        no_ktp_pemohon: data.noKtp,
                        segmentasi: String(data.segmentasi).toLowerCase() as "taspen" | "asabri",
                        jenis_pengajuan: String(data.jenisPengajuan).toLowerCase() as "baru" | "top_up" | "top_up_sisa_gaji" | "takeover",
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

    // Handle Save (Update)
    const handleSave = useCallback(async () => {
        // Validate required fields
        if (!formData.nama_pemohon || !formData.no_ktp_pemohon) {
            alert("Nama Pemohon dan NIK harus diisi!");
            setCurrentTab("tab-a");
            return;
        }

        const result = await updateDebitur(id, {
            namaPemohon: formData.nama_pemohon,
            noKtp: formData.no_ktp_pemohon,
            dataLengkap: formData as Record<string, unknown>,
        });

        if (result) {
            alert("Perubahan berhasil disimpan!");
            resetForm();
            router.push("/debitur");
        } else if (apiError) {
            alert(apiError);
        }
    }, [id, formData, updateDebitur, resetForm, router, setCurrentTab, apiError]);

    // Handle Cancel
    const handleCancel = () => {
        resetForm();
        router.push("/debitur");
    };

    // Render active tab content
    const renderTabContent = () => {
        switch (currentTab) {
            case "tab-a":
                return <TabAIdentitas />;
            case "tab-b":
                return isPurna ? <TabBDataPensiun /> : <TabBPekerjaan />;
            case "tab-c":
                return isPurna ? <TabCPenghasilanPurna /> : <TabCPenghasilan />;
            case "tab-d":
                return <TabDSlik />;
            case "tab-e":
                return <TabEUsulan />;
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
                <h1 className="text-2xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                    Edit Data Debitur
                </h1>
                <div className="card p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                            {loadError}
                        </p>
                        <Link
                            href="/debitur"
                            className="px-4 py-2 bg-[#00665e] text-white rounded-lg hover:bg-[#004d47]"
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
                    <h1 className="text-2xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                        Edit Data {isPurna ? "Purna" : "Prapurna"}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isPurna ? "BNI Fleksi Pensiun Purna" : "BNI Fleksi Pensiun Prapurna"} &bull; {String(formData.nama_pemohon || formData.nama_lengkap || "Loading...")}
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <div className="relative">
                {/* Tab Navigation */}
                <FormTabs kategori={category} />

                {/* Tab Content */}
                <div className="mt-6 animate-fade-in">
                    {renderTabContent()}
                </div>
            </div>

            {/* DSR Widget - Only shown in Usulan Tab */}
            {currentTab === "tab-e" && (
                <DSRCalculator
                    dsrValue={dsrResult?.dsr || 0}
                    limit={90}
                    penghasilan={dsrResult?.penghasilan || 0}
                    totalAngsuran={dsrResult?.totalAngsuranBaru || 0}
                />
            )}

            {/* Actions */}
            <FormActions
                onSave={handleSave}
                onPreview={openPreviewModal}
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
                cancelHref=""
            />
        </div>
    );
}
