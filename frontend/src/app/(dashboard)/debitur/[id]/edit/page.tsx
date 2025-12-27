"use client";

import { use, useEffect } from "react";
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

    // Store
    const {
        currentTab,
        formData,
        dsrResult,
        isSubmitting,
        setIsSubmitting,
        setFormData,
        resetForm,
        setCurrentTab
    } = useFormStore();

    const { openPreviewModal } = useUIStore();

    // Hook
    const { calculateAndUpdateDSR } = useCalculation();

    // Determine type based on ID (Mock Implementation)
    // ID 2 is Purna, others (1, 3) are Prapurna
    const isPurna = id === "2";
    const category = isPurna ? "purna" : "prapurna";

    // Initialize mock data when page loads
    useEffect(() => {
        // Reset tab to A
        setCurrentTab("tab-a");

        // Simulate fetching data
        const mockData = {
            // General
            nama_lengkap: id === "1" ? "Ahmad Sudirman" : id === "2" ? "Budi Raharjo" : "Citra Dewi",
            nik: id === "1" ? "7501234567890001" : id === "2" ? "7501234567890002" : "7501234567890003",
            tempat_lahir: "Jakarta",
            tanggal_lahir: "1980-01-01",
            no_handphone: "081234567890",

            // Segmentasi
            segmentasi: id === "2" ? "asabri" : "taspen",
            jenis_pengajuan: id === "1" ? "baru" : id === "2" ? "top_up" : "takeover",

            // Specifics
            ...(isPurna ? {
                nopen: "123456789",
                pensiun_bulan_jumlah: "4500000"
            } : {
                instansi: "Kementerian Keuangan",
                golongan: "III/a",
                estimasi_hak_pensiun: "500000000"
            })
        };

        setFormData(mockData as any);

    }, [id, setCurrentTab, setFormData, isPurna]);

    // Effect: Calculate DSR automatically
    useEffect(() => {
        calculateAndUpdateDSR(category);
    }, [
        formData,
        calculateAndUpdateDSR,
        category
    ]);

    // Handle Save (Update)
    const handleSave = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert("Perubahan berhasil disimpan!");
        setIsSubmitting(false);
        router.push("/debitur");
    };

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

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#00665e] dark:text-[#80cbc4]">
                        Edit Data {isPurna ? "Purna" : "Prapurna"}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isPurna ? "BNI Fleksi Pensiun Purna" : "BNI Fleksi Pensiun Prapurna"} &bull; {formData.nama_lengkap || "Loading..."}
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
