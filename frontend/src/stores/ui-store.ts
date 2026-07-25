import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
    // Theme
    theme: "light" | "dark";

    // Sidebar
    isSidebarCollapsed: boolean;

    // Modals
    isPreviewModalOpen: boolean;
    isDeleteModalOpen: boolean;
    deleteTargetId: string | null;

    // Actions
    setTheme: (theme: "light" | "dark") => void;
    toggleTheme: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;
    openPreviewModal: () => void;
    closePreviewModal: () => void;
    openDeleteModal: (id: string) => void;
    closeDeleteModal: () => void;
}

export const useUIStore = create<UIStore>()(
    persist(
        (set, get) => ({
            // Initial state
            theme: "light",
            isSidebarCollapsed: true,
            isPreviewModalOpen: false,
            isDeleteModalOpen: false,
            deleteTargetId: null,

            // Theme actions
            setTheme: (theme) => {
                set({ theme });
                if (typeof window !== "undefined") {
                    document.documentElement.classList.toggle("dark", theme === "dark");
                }
            },

            toggleTheme: () => {
                const newTheme = get().theme === "light" ? "dark" : "light";
                set({ theme: newTheme });
                if (typeof window !== "undefined") {
                    document.documentElement.classList.toggle("dark", newTheme === "dark");
                }
            },

            // Sidebar actions
            setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
            toggleSidebar: () =>
                set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

            // Modal actions
            openPreviewModal: () => set({ isPreviewModalOpen: true }),
            closePreviewModal: () => set({ isPreviewModalOpen: false }),
            openDeleteModal: (id) =>
                set({ isDeleteModalOpen: true, deleteTargetId: id }),
            closeDeleteModal: () =>
                set({ isDeleteModalOpen: false, deleteTargetId: null }),
        }),
        {
            name: "ui-store",
            partialize: (state) => ({
                theme: state.theme,
            }),
        }
    )
);
