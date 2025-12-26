// Form Types

export interface FormTab {
    id: string;
    label: string;
    shortLabel: string;
}

export interface FormField {
    name: string;
    label: string;
    type: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
    placeholder?: string;
    required?: boolean;
    options?: FormOption[];
    maxLength?: number;
    min?: number;
    max?: number;
}

export interface FormOption {
    value: string;
    label: string;
}

export interface FormSection {
    title: string;
    fields: FormField[];
}

export interface FormState {
    currentTab: string;
    isDirty: boolean;
    isSubmitting: boolean;
    errors: Record<string, string>;
}
