"use client";

import { useFormStore } from "@/stores/form-store";

interface FormTabsProps {
    kategori: "type_a" | "type_b" | "type_c";
}

const type_aTabs = [
    { id: "tab-a", label: "Identitas", shortLabel: "A" },
    { id: "tab-b", label: "Pekerjaan", shortLabel: "B" },
    { id: "tab-c", label: "Penghasilan", shortLabel: "C" },
    { id: "tab-d", label: "Data Eksternal", shortLabel: "D" },
    { id: "tab-e", label: "Proposal", shortLabel: "E" },
];

const type_bTabs = [
    { id: "tab-a", label: "Identitas", shortLabel: "A" },
    { id: "tab-b", label: "Data Pensiun", shortLabel: "B" },
    { id: "tab-c", label: "Penghasilan", shortLabel: "C" },
    { id: "tab-d", label: "Data Eksternal", shortLabel: "D" },
    { id: "tab-e", label: "Proposal", shortLabel: "E" },
];

const type_cTabs = [
    { id: "tab-a", label: "Identitas", shortLabel: "A" },
    { id: "tab-b", label: "Pekerjaan", shortLabel: "B" },
    { id: "tab-c", label: "Penghasilan", shortLabel: "C" },
    { id: "tab-d", label: "Data Eksternal", shortLabel: "D" },
    { id: "tab-e", label: "Proposal", shortLabel: "E" },
];

export default function FormTabs({ kategori }: FormTabsProps) {
    const { currentTab, setCurrentTab } = useFormStore();

    let tabs = type_aTabs;
    if (kategori === "type_b") tabs = type_bTabs;
    if (kategori === "type_c") tabs = type_cTabs;

    return (
        <div className="sticky top-0 z-10 bg-[#f5f8f8] dark:bg-[#0f2322] pt-2 pb-4 -mx-2 px-2">
            <div className="border-b border-[#cdeae7] dark:border-[#1f3b39] overflow-x-auto">
                <nav aria-label="Tabs" className="-mb-px flex gap-6 md:gap-8 min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id)}
                            className={`group inline-flex items-center py-4 px-1 border-b-[3px] font-bold text-sm transition-all ${currentTab === tab.id
                                ? "border-brand text-brand"
                                : "border-transparent text-[#45a199] hover:text-brand hover:border-gray-300"
                                }`}
                        >
                            <span
                                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs mr-2 transition-colors ${currentTab === tab.id
                                    ? "bg-brand text-white"
                                    : "bg-[#45a199]/20 text-[#45a199] group-hover:bg-brand/20 group-hover:text-brand"
                                    }`}
                            >
                                {tab.shortLabel}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
