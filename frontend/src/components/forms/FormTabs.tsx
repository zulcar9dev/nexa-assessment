"use client";

import Link from "next/link";
import { useFormStore } from "@/stores/form-store";

interface FormTabsProps {
    kategori: "prapurna" | "purna";
}

const prapurnaTabs = [
    { id: "tab-a", label: "Identitas", shortLabel: "A" },
    { id: "tab-b", label: "Pekerjaan", shortLabel: "B" },
    { id: "tab-c", label: "Penghasilan", shortLabel: "C" },
    { id: "tab-d", label: "SLIK", shortLabel: "D" },
    { id: "tab-e", label: "Usulan", shortLabel: "E" },
];

const purnaTabs = [
    { id: "tab-a", label: "Identitas", shortLabel: "A" },
    { id: "tab-b", label: "Data Pensiun", shortLabel: "B" },
    { id: "tab-c", label: "Penghasilan", shortLabel: "C" },
    { id: "tab-d", label: "SLIK", shortLabel: "D" },
    { id: "tab-e", label: "Usulan", shortLabel: "E" },
];

export default function FormTabs({ kategori }: FormTabsProps) {
    const { currentTab, setCurrentTab } = useFormStore();
    const tabs = kategori === "prapurna" ? prapurnaTabs : purnaTabs;

    return (
        <div className="sticky top-0 z-10 bg-[#f5f8f8] dark:bg-[#0f2322] pt-2 pb-4 -mx-2 px-2">
            <div className="border-b border-[#cdeae7] dark:border-[#1f3b39] overflow-x-auto">
                <nav aria-label="Tabs" className="-mb-px flex gap-6 md:gap-8 min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id)}
                            className={`group inline-flex items-center py-4 px-1 border-b-[3px] font-bold text-sm transition-all ${currentTab === tab.id
                                    ? "border-[#00665e] text-[#00665e]"
                                    : "border-transparent text-[#45a199] hover:text-[#00665e] hover:border-gray-300"
                                }`}
                        >
                            <span
                                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs mr-2 transition-colors ${currentTab === tab.id
                                        ? "bg-[#00665e] text-white"
                                        : "bg-[#45a199]/20 text-[#45a199] group-hover:bg-[#00665e]/20 group-hover:text-[#00665e]"
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
