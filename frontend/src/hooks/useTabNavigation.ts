"use client";

import { useCallback } from "react";
import { useFormStore } from "@/stores/form-store";

// Tab order untuk navigasi
const TAB_ORDER = ["tab-a", "tab-b", "tab-c", "tab-d", "tab-e"];

interface UseTabNavigationReturn {
    /**
     * Handler untuk navigasi ke tab berikutnya
     * Digunakan pada field terakhir di setiap tab
     */
    handleTabToNext: (e: React.KeyboardEvent<HTMLElement>) => void;

    /**
     * Handler untuk navigasi ke tab sebelumnya
     * Digunakan pada field pertama di setiap tab dengan Shift+Tab
     */
    handleTabToPrev: (e: React.KeyboardEvent<HTMLElement>) => void;

    /**
     * Pindah ke tab berikutnya dan fokus field pertama
     */
    goToNextTab: () => void;

    /**
     * Pindah ke tab sebelumnya dan fokus field terakhir
     */
    goToPrevTab: () => void;

    /**
     * Fokus field pertama di tab saat ini
     */
    focusFirstField: () => void;
}

/**
 * Hook untuk menangani navigasi Tab keyboard antar tab form
 * Memungkinkan user untuk berpindah dari field terakhir tab A ke field pertama tab B, dst
 */
export function useTabNavigation(): UseTabNavigationReturn {
    const { currentTab, setCurrentTab } = useFormStore();

    /**
     * Mencari dan fokus field pertama/terakhir dalam tab container
     */
    const focusFieldInTab = useCallback((tabId: string, position: "first" | "last") => {
        // Tunggu DOM update setelah tab berubah
        requestAnimationFrame(() => {
            // Cari container tab yang aktif
            const tabContent = document.querySelector(`[data-tab-content="${tabId}"]`);
            if (!tabContent) {
                // Fallback: cari form di dalam container utama
                const forms = document.querySelectorAll("form");
                forms.forEach(form => {
                    const focusableElements = getFocusableElements(form);
                    if (focusableElements.length > 0) {
                        const targetElement = position === "first"
                            ? focusableElements[0]
                            : focusableElements[focusableElements.length - 1];
                        (targetElement as HTMLElement).focus();
                    }
                });
                return;
            }

            const focusableElements = getFocusableElements(tabContent as HTMLElement);
            if (focusableElements.length > 0) {
                const targetElement = position === "first"
                    ? focusableElements[0]
                    : focusableElements[focusableElements.length - 1];
                (targetElement as HTMLElement).focus();
            }
        });
    }, []);

    /**
     * Mendapatkan semua elemen focusable dalam container
     */
    const getFocusableElements = (container: HTMLElement): NodeListOf<Element> => {
        return container.querySelectorAll(
            'input:not([disabled]):not([type="hidden"]), ' +
            'select:not([disabled]), ' +
            'textarea:not([disabled]), ' +
            'button:not([disabled]):not([type="button"]):not([tabindex="-1"]), ' +
            '[tabindex]:not([tabindex="-1"]):not([disabled])'
        );
    };

    /**
     * Pindah ke tab berikutnya
     */
    const goToNextTab = useCallback(() => {
        const currentIndex = TAB_ORDER.indexOf(currentTab);
        if (currentIndex < TAB_ORDER.length - 1) {
            const nextTab = TAB_ORDER[currentIndex + 1];
            setCurrentTab(nextTab);
            focusFieldInTab(nextTab, "first");
        }
    }, [currentTab, setCurrentTab, focusFieldInTab]);

    /**
     * Pindah ke tab sebelumnya
     */
    const goToPrevTab = useCallback(() => {
        const currentIndex = TAB_ORDER.indexOf(currentTab);
        if (currentIndex > 0) {
            const prevTab = TAB_ORDER[currentIndex - 1];
            setCurrentTab(prevTab);
            focusFieldInTab(prevTab, "last");
        }
    }, [currentTab, setCurrentTab, focusFieldInTab]);

    /**
     * Handler untuk Tab pada field terakhir -> pindah ke tab berikutnya
     */
    const handleTabToNext = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
        // Hanya handle Tab key tanpa Shift
        if (e.key === "Tab" && !e.shiftKey) {
            const currentIndex = TAB_ORDER.indexOf(currentTab);

            // Jika bukan tab terakhir, pindah ke tab berikutnya
            if (currentIndex < TAB_ORDER.length - 1) {
                e.preventDefault();
                goToNextTab();
            }
        }
    }, [currentTab, goToNextTab]);

    /**
     * Handler untuk Shift+Tab pada field pertama -> pindah ke tab sebelumnya
     */
    const handleTabToPrev = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
        // Hanya handle Shift+Tab
        if (e.key === "Tab" && e.shiftKey) {
            const currentIndex = TAB_ORDER.indexOf(currentTab);

            // Jika bukan tab pertama, pindah ke tab sebelumnya
            if (currentIndex > 0) {
                e.preventDefault();
                goToPrevTab();
            }
        }
    }, [currentTab, goToPrevTab]);

    /**
     * Fokus field pertama di tab saat ini
     */
    const focusFirstField = useCallback(() => {
        focusFieldInTab(currentTab, "first");
    }, [currentTab, focusFieldInTab]);

    return {
        handleTabToNext,
        handleTabToPrev,
        goToNextTab,
        goToPrevTab,
        focusFirstField,
    };
}
