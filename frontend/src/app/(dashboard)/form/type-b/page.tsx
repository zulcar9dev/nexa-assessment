"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clientPurnaSchema, getTabForField, formatValidationErrors } from "@/lib/validations";

// Stores & Hooks
import { useFormStore } from "@/stores/form-store";
import { useShallow } from "zustand/react/shallow";
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
    const router = useRouter();

    // Use shallow selectors to prevent re-renders on unrelated changes (e.g. typing name)
    const {
        currentTab,
        dsrResult,
        isSubmitting,
        submitError,
        validationErrors,
        resetForm,
        setCurrentTab,
        submitForm
    } = useFormStore(useShallow(state => ({
        currentTab: state.currentTab,
        dsrResult: state.dsrResult,
        isSubmitting: state.isSubmitting,
        submitError: state.submitError,
        validationErrors: state.validationErrors,
        resetForm: state.resetForm,
        setCurrentTab: state.setCurrentTab,
        submitForm: state.submitForm
    })));

    const { openPreviewModal } = useUIStore();

    // Select only data needed for DSR calculation
    const dsrInputs = useFormStore(useShallow(state => ({
        pensiun_bulan_1_jumlah: state.formData.pensiun_bulan_1_jumlah,
        pensiun_bulan_2_jumlah: state.formData.pensiun_bulan_2_jumlah,
        pensiun_bulan_3_jumlah: state.formData.pensiun_bulan_3_jumlah,
        pensiun_bulan_jumlah: state.formData.pensiun_bulan_jumlah,
        type_b_penghasilan_mode: state.formData.type_b_penghasilan_mode,
        slik_facilities: state.formData.slik_facilities,
        usulan_plafon_kredit: state.formData.usulan_plafon_kredit,
        usulan_jangka_waktu_bulan: state.formData.usulan_jangka_waktu_bulan,
        usulan_bunga_persen: state.formData.usulan_bunga_persen,
        fasilitas_nihil: state.formData.fasilitas_nihil,
    })));

    // Hook
    const { calculateAndUpdateDSR } = useCalculation();

    // Effect: Reset form and set initial tab on mount
    useEffect(() => {
        resetForm();
        setCurrentTab("tab-a");
    }, [resetForm, setCurrentTab]);

    // Effect: Calculate DSR automatically when relevant data changes
    useEffect(() => {
        calculateAndUpdateDSR("type_b");
    }, [
        dsrInputs.pensiun_bulan_1_jumlah,
        dsrInputs.pensiun_bulan_2_jumlah,
        dsrInputs.pensiun_bulan_3_jumlah,
        dsrInputs.pensiun_bulan_jumlah,
        dsrInputs.type_b_penghasilan_mode,
        dsrInputs.slik_facilities,
        dsrInputs.usulan_plafon_kredit,
        dsrInputs.usulan_jangka_waktu_bulan,
        dsrInputs.usulan_bunga_persen,
        dsrInputs.fasilitas_nihil,
        calculateAndUpdateDSR
    ]);

    // Handle Save - Uses Zod validation & real API
    const handleSave = async () => {
        // Read current state directly to avoid subscribing to all fields
        const currentFormData = useFormStore.getState().formData;

        // Zod validation client-side
        const validation = clientPurnaSchema.safeParse(currentFormData);
        if (!validation.success) {
            const errors = validation.error.errors;
            const errorMessage = formatValidationErrors(errors);
            alert(`Validasi Gagal:\n\n${errorMessage}`);
            // Map first error field to tab and navigate to it
            const firstError = errors[0];
            const errorTab = getTabForField(firstError.path[0] as string);
            setCurrentTab(errorTab);
            return;
        }

        const result = await submitForm("type_b", "SUBMITTED");

        if (result.success) {
            alert("Data Purna berhasil disimpan!");
            resetForm();
            router.push("/clients");
        } else if (submitError) {
            alert(submitError);
        }
    };

    // Handle Save Draft - minimal validation
    const handleSaveDraft = async () => {
        const currentFormData = useFormStore.getState().formData;

        if (!currentFormData.nama_pemohon || currentFormData.nama_pemohon.trim() === "") {
            alert("Nama Pemohon wajib diisi untuk menyimpan draft!");
            setCurrentTab("tab-a");
            return;
        }
        if (!currentFormData.no_ktp_pemohon || currentFormData.no_ktp_pemohon.trim() === "") {
            alert("NIK wajib diisi untuk menyimpan draft!");
            setCurrentTab("tab-a");
            return;
        }

        const result = await submitForm("type_b", "DRAFT");

        if (result.success) {
            alert("Draft berhasil disimpan!");
            resetForm();
            router.push("/clients");
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
                return <TabBDataPensiun />;
            case "tab-c":
                return <TabCPenghasilanPurna />;
            case "tab-d":
                return <TabDSlik />;
            case "tab-e":
                return <TabEUsulan kategori="type_b" />;
            default:
                return <TabAIdentitas />;
        }
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-headline-lg text-headline-lg text-on-background">
                        Assessment Type B (Full-Period)
                    </h1>
                    <p className="font-body-base text-body-base text-on-surface-variant">
                        Input Data Purna
                    </p>
                </div>
            </div>

            {/* Error Display */}
            {(submitError || validationErrors.length > 0) && (
                <div className="rounded-lg bg-danger/10 p-4 border border-danger/20">
                    {submitError && (
                        <p className="text-sm text-danger font-medium">{submitError}</p>
                    )}
                    {validationErrors.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-sm text-danger/80">
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
                <FormTabs kategori="type_b" />

                {/* Tab Content */}
                <div className="mt-6 animate-in fade-in duration-300">
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
                onSaveDraft={handleSaveDraft}
                onPreview={openPreviewModal}
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
                cancelHref=""
            />
        </div>
    );
}

