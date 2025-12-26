"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
import TabBDataPensiun from "@/components/forms/form-tabs/TabBDataPensiun";
import TabCPenghasilanPurna from "@/components/forms/form-tabs/TabCPenghasilanPurna";
import TabDSlik from "@/components/forms/form-tabs/TabDSlik";
import TabEUsulan from "@/components/forms/form-tabs/TabEUsulan";

export default function FormPurnaPage() {
    // Store
    const { currentTab, formData, dsrResult, isSubmitting, setIsSubmitting } = useFormStore();
    const { openPreviewModal } = useUIStore();

    // Hook
    const { calculateAndUpdateDSR } = useCalculation();

    // Effect: Calculate DSR automatically when relevant data changes
    useEffect(() => {
        calculateAndUpdateDSR("purna");
    }, [
        formData.pensiun_bulan_1_jumlah,
        formData.pensiun_bulan_2_jumlah,
        formData.pensiun_bulan_3_jumlah,
        formData.pensiun_bulan_jumlah,
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
        alert("Data Purna berhasil disimpan (Draft)");
        setIsSubmitting(false);
    };

    // Render active tab content
    const renderTabContent = () => {
        switch (currentTab) {
            case "tab-a":
                return <TabAIdentitas />;
            case "tab-b":
                return <TabBDataPensiun />;
            case "tab-c":
                return <TabCPenghasilanPurna />;
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
                    <Link
                        href="/"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#323249] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                            Input Data Purna
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            BNI Fleksi Pensiun Purna
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="relative">
                {/* Tab Navigation */}
                <FormTabs kategori="purna" />

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
                cancelHref="/"
            />
        </div>
    );
}
