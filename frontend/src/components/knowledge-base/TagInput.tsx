"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = "Tambah kata kunci..." }: TagInputProps) {
    const [inputValue, setInputValue] = useState("");

    const addTag = (tag: string) => {
        const trimmed = tag.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInputValue("");
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    return (
        <div
            className="flex flex-wrap items-center gap-2 p-2.5
                bg-white dark:bg-[#323249]
                border border-gray-200 dark:border-[#444564]
                rounded-lg
                focus-within:ring-2 focus-within:ring-[#00665e]/20 focus-within:border-[#00665e]
                transition-all duration-200 min-h-[42px]"
        >
            {tags.map((tag, index) => (
                <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-1
                        bg-[#e0f2f1] dark:bg-[#00665e]/20
                        text-[#00665e] dark:text-[#80cbc4]
                        rounded-full text-xs font-medium
                        animate-fade-in"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-0.5 hover:text-red-500 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => inputValue && addTag(inputValue)}
                placeholder={tags.length === 0 ? placeholder : ""}
                className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm
                    text-gray-700 dark:text-gray-300
                    placeholder-gray-400 dark:placeholder-gray-500"
            />
        </div>
    );
}
