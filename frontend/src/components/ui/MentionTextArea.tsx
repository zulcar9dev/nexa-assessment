"use client";

import React, { useState, useRef, useEffect } from "react";

interface Option {
    label: string;
    value: string;
}

interface MentionTextAreaProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    rows?: number;
    className?: string;
}

export const MentionTextArea: React.FC<MentionTextAreaProps> = ({
    value,
    onChange,
    options,
    placeholder,
    rows = 3,
    className,
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const suggestionRef = useRef<HTMLDivElement>(null);
    const nextCursorPosition = useRef<number | null>(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showSuggestions) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSuggestionIndex((prev) => (prev + 1) % filteredOptions.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSuggestionIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
            } else if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                if (filteredOptions.length > 0) {
                    selectOption(filteredOptions[suggestionIndex]);
                }
            } else if (e.key === "Escape") {
                setShowSuggestions(false);
            }
        } else {
            // Trigger on @
            if (e.key === "@") {
                // Let the @ be typed first, then handle in onChange or here
                // We handle logic in onChange to capture the latest value
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const newCursorPos = e.target.selectionStart;

        onChange(newValue);
        setCursorPosition(newCursorPos);

        // Check for trigger character '@' before cursor
        const textBeforeCursor = newValue.substring(0, newCursorPos);
        const lastAtPos = textBeforeCursor.lastIndexOf("@");

        if (lastAtPos !== -1) {
            // Check if there are valid characters between @ and cursor (no spaces for simple implementation, 
            // or allow spaces if we want multi-word search)
            // Let's assume we want to search immediately after @ until space or cursor
            const query = textBeforeCursor.substring(lastAtPos + 1);

            // Simple logic: if query contains newline, abort
            if (!query.includes("\n")) {
                setSearchTerm(query);
                setShowSuggestions(true);
                setSuggestionIndex(0);
                return;
            }
        }

        setShowSuggestions(false);
    };

    const selectOption = (option: Option) => {
        // Use current selection start if available to ensure we have the most up-to-date position
        const currentPos = textareaRef.current ? textareaRef.current.selectionStart : cursorPosition;
        const textBeforeCursor = value.substring(0, currentPos);
        const lastAtPos = textBeforeCursor.lastIndexOf("@");

        if (lastAtPos !== -1) {
            const prefix = value.substring(0, lastAtPos);
            const suffix = value.substring(currentPos);
            const insertion = option.value + " "; // Add space after mention
            
            const newValue = `${prefix}${insertion}${suffix}`;
            
            // Calculate where cursor should be: prefix length + insertion length
            const newCursorPos = prefix.length + insertion.length;
            nextCursorPosition.current = newCursorPos;

            onChange(newValue);
            setShowSuggestions(false);

            // Focus textarea
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    };

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node) &&
                textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    // Calculate coordinates for the dropdown
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const getCaretCoordinates = () => {
        if (!textareaRef.current) return { top: 0, left: 0 };

        const element = textareaRef.current;

        // Create a mirror div to calculate position
        const div = document.createElement('div');
        const style = window.getComputedStyle(element);

        // Copy styles to mirror div
        Array.from(style).forEach((prop) => {
            div.style.setProperty(prop, style.getPropertyValue(prop), style.getPropertyPriority(prop));
        });

        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordWrap = 'break-word';
        div.style.top = '0';
        div.style.left = '0';

        // Content up to caret
        const textContent = element.value.substring(0, element.selectionStart);
        const span = document.createElement('span');
        span.textContent = textContent;
        div.appendChild(span);

        document.body.appendChild(div);

        // Calculate position - using marker approach
        // Better strategy: creating a span for the text before caret is good, 
        // but we need the position of the *end* of that text.
        // Let's use a simpler method often used:
        // The span ends exactly where the caret is.

        // Actually, appending a marker might be easier
        const marker = document.createElement('span');
        marker.textContent = '|';
        div.appendChild(marker);

        // Position relative to the textarea

        // Position relative to the textarea
        // But since we appended div to body (to avoid container restrictions), we need absolute page coords?
        // IF we append to a relative parent, we get local coords.

        // Let's get offset inside the div
        const markerOffsetLeft = marker.offsetLeft;
        const markerOffsetTop = marker.offsetTop;

        document.body.removeChild(div);

        // Adjust for scroll
        const top = markerOffsetTop - element.scrollTop + 20; // 20px padding/line height approx
        const left = markerOffsetLeft - element.scrollLeft;

        return { top, left };
    };

    const updateDropdownPosition = () => {
        const { top, left } = getCaretCoordinates();
        setCoords({ top, left });
    };

    // Update position when showing suggestions
    useEffect(() => {
        if (showSuggestions) {
            updateDropdownPosition();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showSuggestions, value, cursorPosition]);

    // Restore cursor position after value update
    useEffect(() => {
        if (nextCursorPosition.current !== null && textareaRef.current) {
            textareaRef.current.setSelectionRange(nextCursorPosition.current, nextCursorPosition.current);
            nextCursorPosition.current = null;
        }
    }, [value]);

    // Handle scroll sync for backdrop
    const handleScroll = () => {
        if (textareaRef.current) {
            const backdrop = textareaRef.current.previousElementSibling;
            if (backdrop) {
                backdrop.scrollTop = textareaRef.current.scrollTop;
                backdrop.scrollLeft = textareaRef.current.scrollLeft;
            }
        }
    };

    // Render logic for backdrop content
    const renderBackdrop = () => {
        // Split by newline to handle line-based coloring
        // Note: We need to handle trailing newline carefully for display match
        const lines = value.split("\n");
        return lines.map((line, i) => {
            const isComment = line.trimStart().startsWith("/*");
            // Use non-breaking space for empty lines to maintain height
            const content = line || " ";
            return (
                <div key={i} className={isComment ? "text-gray-400 italic w-full" : "text-gray-900 dark:text-gray-100"}>
                    {content}
                </div>
            );
        });
    };

    return (
        <div className="relative w-full group">
            {/* Backdrop for highlighting */}
            <div
                className={`absolute inset-0 z-0 pointer-events-none whitespace-pre-wrap break-words overflow-auto border border-transparent bg-transparent
                   ${className} 
                   !text-transparent !shadow-none !ring-0
                `}
                aria-hidden="true"
            >
                {renderBackdrop()}
            </div>

            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                placeholder={placeholder}
                rows={rows}
                // Text color must be transparent to show backdrop, BUT standard caret color (black/white)
                // We also need to be careful about background color.
                // The textarea should have transparent background.
                className={`${className} relative z-10 !bg-transparent !text-transparent caret-black dark:caret-white`}
                style={{
                    // No inline caretColor to avoid overriding tailwind classes
                }}
            />

            {/* 
               Correction: Setting color: transparent effectively hides the text the user is typing, 
               relying entirely on the backdrop. This is risky for alignment.
               
               Alternative "Poor Man's Highlighter":
               Keep textarea opaque.
               Only color lines that are comments? 
               We can't color specific lines in textarea.
               
               Let's stick to the Backdrop method but ensure styling matches EXACTLY.
               Common classes (p-3, font-mono, text-sm, leading-normal etc) must match 1:1.
            */}


            {showSuggestions && filteredOptions.length > 0 && (
                <div
                    ref={suggestionRef}
                    className="absolute z-50 w-64 mt-1 bg-white dark:bg-[#1a2c2a] border border-[#cdeae7] dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
                    style={{
                        top: coords.top + "px",
                        left: coords.left + "px"
                    }}
                >
                    {filteredOptions.map((option, index) => (
                        <div
                            key={option.value}
                            className={`px-4 py-2 cursor-pointer text-sm ${index === suggestionIndex
                                ? "bg-primary-brand text-white"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            onClick={() => selectOption(option)}
                        >
                            <div className="font-medium">{option.label}</div>
                            <div className={`text-xs ${index === suggestionIndex ? "text-gray-200" : "text-gray-500"}`}>
                                {option.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
