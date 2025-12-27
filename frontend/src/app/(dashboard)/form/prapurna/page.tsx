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
    const { currentTab, formData, dsrResult, isSubmitting, setIsSubmitting, resetForm, setCurrentTab } = useFormStore();
    const { openPreviewModal } = useUIStore();

    // Hook
    const { calculateAndUpdateDSR } = useCalculation();

    // Effect: Set initial tab on mount
    useEffect(() => {
        setCurrentTab("tab-a");
    }, [setCurrentTab]);

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

    // Handle Save
    const handleSave = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert("Data berhasil disimpan (Draft)");
        setIsSubmitting(false);
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
