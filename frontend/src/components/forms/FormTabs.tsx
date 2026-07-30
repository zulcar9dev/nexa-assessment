"use client";

import { useFormStore } from "@/stores/form-store";
import { Check } from "lucide-react";

interface FormTabsProps {
    kategori: "type_a" | "type_b" | "type_c";
}

const type_aTabs = [
    { id: "tab-a", label: "Identitas", shortLabel: "1" },
    { id: "tab-b", label: "Pekerjaan", shortLabel: "2" },
    { id: "tab-c", label: "Penghasilan", shortLabel: "3" },
    { id: "tab-d", label: "Data Eksternal", shortLabel: "4" },
    { id: "tab-e", label: "Proposal", shortLabel: "5" },
];

const type_bTabs = [
    { id: "tab-a", label: "Identitas", shortLabel: "1" },
    { id: "tab-b", label: "Data Pensiun", shortLabel: "2" },
    { id: "tab-c", label: "Penghasilan", shortLabel: "3" },
    { id: "tab-d", label: "Data Eksternal", shortLabel: "4" },
    { id: "tab-e", label: "Proposal", shortLabel: "5" },
];

const type_cTabs = [
    { id: "tab-a", label: "Identitas", shortLabel: "1" },
    { id: "tab-b", label: "Pekerjaan", shortLabel: "2" },
    { id: "tab-c", label: "Penghasilan", shortLabel: "3" },
    { id: "tab-d", label: "Data Eksternal", shortLabel: "4" },
    { id: "tab-e", label: "Proposal", shortLabel: "5" },
];

export default function FormTabs({ kategori }: FormTabsProps) {
    const { currentTab, setCurrentTab } = useFormStore();

    let tabs = type_aTabs;
    if (kategori === "type_b") tabs = type_bTabs;
    if (kategori === "type_c") tabs = type_cTabs;

    const currentIndex = tabs.findIndex(tab => tab.id === currentTab);

    return (
        <div className="bg-surface-light p-4 lg:p-6 rounded-xl shadow-sm border border-outline-variant/20 overflow-x-auto scrollbar-hide">
            <div className="flex items-center min-w-[600px] justify-between relative">
                {/* Connecting Lines */}
                <div className="absolute top-[20px] left-[10%] right-[10%] h-[2px] bg-surface-container-high z-0"></div>
                <div 
                    className="absolute top-[20px] left-[10%] h-[2px] bg-primary z-0 transition-all duration-300"
                    style={{ width: `${(currentIndex / (tabs.length - 1)) * 80}%` }}
                ></div>

                {tabs.map((tab, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;
                    
                    return (
                        <div key={tab.id} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                            <button
                                type="button"
                                onClick={() => setCurrentTab(tab.id)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    isCompleted
                                        ? "bg-primary text-white shadow-md"
                                        : isActive
                                            ? "bg-primary text-white shadow-lg ring-4 ring-primary/10"
                                            : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                                }`}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span className="font-title-sm text-title-sm">{tab.shortLabel}</span>
                                )}
                            </button>
                            <span 
                                className={`font-title-sm text-title-sm ${
                                    isActive || isCompleted ? "text-primary" : "text-on-surface-variant"
                                }`}
                            >
                                {tab.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
