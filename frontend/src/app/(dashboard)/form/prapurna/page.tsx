"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Stores & Hooks
import { useFormStore } from "@/stores/form-store";
import { useUIStore } from "@/stores/ui-store";
import { useCalculation } from "@/hooks/use-calculation";

// Components
import FormTabs from "@/components/forms/FormTabs";
import FormActions from "@/components/forms/FormActions";
import DSRCalculator from "@/components/forms/DSRCalculator";

// Tab Components
import TabAIdentitas from "@/components/forms/form-tabs/TabAIdentitas";
import TabBPekerjaan from "@/components/forms/form-tabs/TabBPekerjaan";
import TabCPenghasilan from "@/components/forms/form-tabs/TabCPenghasilan";
import TabDSlik from "@/components/forms/form-tabs/TabDSlik";
import TabEUsulan from "@/components/forms/form-tabs/TabEUsulan";

export default function FormPrapurnaPage() {
    // Store
    const router = useRouter();
    const {
        currentTab,
        formData,
        dsrResult,
        isSubmitting,
        submitError,
        validationErrors,
        resetForm,
        setCurrentTab,
        submitForm,
        clearErrors
    } = useFormStore();
    const { openPreviewModal } = useUIStore();

    // Hook
    const { calculateAndUpdateDSR } = useCalculation();

    // Effect: Set initial tab on mount
    useEffect(() => {
        setCurrentTab("tab-a");
        clearErrors();
    }, [setCurrentTab, clearErrors]);

    // Effect: Calculate DSR automatically when relevant data changes
    useEffect(() => {
        calculateAndUpdateDSR("prapurna");
    }, [
        formData.estimasi_hak_pensiun,
        formData.slik_facilities,
        formData.usulan_plafon_kredit,
        formData.usulan_jangka_waktu_bulan,
        formData.usulan_bunga_persen,
        formData.fasilitas_nihil,
        calculateAndUpdateDSR
    ]);

    // Handle Save - Uses real API
    const handleSave = async () => {
        // Validate required fields
        if (!formData.nama_pemohon || !formData.no_ktp_pemohon) {
            alert("Nama Pemohon dan NIK harus diisi!");
            setCurrentTab("tab-a");
            return;
        }

        const result = await submitForm("prapurna", false);

        if (result.success) {
            alert("Data berhasil disimpan!");
            resetForm();
            router.push("/debitur");
        } else if (submitError) {
            alert(submitError);
        }
    };

    // Handle Cancel
    const handleCancel = () => {
        resetForm();
        router.push("/");
    };

    // Render active tab content
    const renderTabContent = () => {
        switch (currentTab) {
            case "tab-a":
                return <TabAIdentitas />;
            case "tab-b":
                return <TabBPekerjaan />;
            case "tab-c":
                return <TabCPenghasilan />;
            case "tab-d":
                return <TabDSlik />;
            case "tab-e":
                return <TabEUsulan />;
            default:
                return <TabAIdentitas />;
        }
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                            Input Data Prapurna
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            BNI Fleksi Pensiun Prapurna
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {(submitError || validationErrors.length > 0) && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                    {submitError && (
                        <p className="text-sm text-red-800 dark:text-red-300 font-medium">{submitError}</p>
                    )}
                    {validationErrors.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-sm text-red-700 dark:text-red-400">
                            {validationErrors.map((err, idx) => (
                                <li key={idx}>{err.field}: {err.message}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Form Section */}
            <div className="relative">
                {/* Tab Navigation */}
                <FormTabs kategori="prapurna" />

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
