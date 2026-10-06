"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function CreateTaskForm() {

    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const itemRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isChecklistMode, setIsChecklistMode] = useState(false);
    const [items, setItems] = useState<string[]>([""]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasContent = title.trim().length > 0 || (isChecklistMode && items.some((item) => item.trim().length > 0));

    const resetAndCollapse = () => {
        setTitle("");
        setDescription("");
        setIsChecklistMode(false);
        setItems([""]);
        setError("");
        setIsExpanded(false);
    };

    const enterChecklistMode = () => {
        setIsExpanded(true);
        setIsChecklistMode(true);
        setItems([""]);
        
        setTimeout(() => itemRefs.current[0]?.focus(), 0);
    };

    const updateItem = (index: number, value: string) => {
        setItems((prev) => prev.map((item, i) => (i === index ? value : item)));
    };

    const addItemAfter = (index: number) => {
        setItems((prev) => {
            const next = [...prev];
            next.splice(index + 1, 0, "");
            return next;
        });
        setTimeout(() => itemRefs.current[index + 1]?.focus(), 0);
    };

    const removeItemRow = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (!isExpanded) return;

        function handleClickOutside(event: MouseEvent) {
            if (formRef.current && !formRef.current.contains(event.target as Node)) {
                resetAndCollapse();
            };
        };

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                resetAndCollapse();
            };
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
        };
    }, [isExpanded]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hasContent) return;

        setError("");
        setIsSubmitting(true);

        const taskResponse = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: title.trim() || undefined,
                description: isChecklistMode ? undefined : description || undefined,
                isChecklist: isChecklistMode,
            }),
        });

        if (!taskResponse.ok) {
            setIsSubmitting(false);
            const body = await taskResponse.json();
            setError(body.errors?.[0] || body.error || "Failed to create task");
            return;
        };

        const createdTask = await taskResponse.json();

        if (isChecklistMode) {
            const itemTexts = items.map((text) => text.trim()).filter((text) => text.length > 0);

            for (const text of itemTexts) {
                await fetch(`/api/tasks/${createdTask.id}/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text }),
                });
            }
        };

        setIsSubmitting(false);
        resetAndCollapse();
        router.refresh();
    };

    return (
        <form
            ref={formRef}
            data-testid="create-task-form"
            onSubmit={handleSubmit}
            className="mx-auto mb-8 w-full max-w-xl rounded-xl border border-zinc-700 bg-zinc-800 p-3 transition-colors focus-within:border-zinc-500"
        >
            <div className="flex items-center gap-2">
                <input
                    data-testid="create-task-title-input"
                    placeholder={isExpanded ? "Title" : "Take a note..."}
                    value={title}
                    onFocus={() => setIsExpanded(true)}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-base font-semibold text-zinc-100 outline-none placeholder:text-zinc-400"
                />

                {!isExpanded && (
                    <button
                        type="button"
                        data-testid="create-task-checklist-toggle"
                        onClick={enterChecklistMode}
                        aria-label="New checklist"
                        className="flex-shrink-0 cursor-pointer rounded p-1 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9" />
                        </svg>
                    </button>
                )}
            </div>

            {isExpanded && !isChecklistMode && (
                <textarea
                    data-testid="create-task-description-input"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="mt-3 w-full resize-none bg-transparent text-sm text-zinc-300 outline-none placeholder:text-zinc-500"
                />
            )}

            {isChecklistMode && (
                <div data-testid="create-task-items-list" className="mt-2 flex flex-col gap-1.5 pr-4">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 py-1">
                        <div className="h-3.5 w-3.5 flex-shrink-0 rounded border border-zinc-500" />
                            <input
                                ref={(el) => { itemRefs.current[index] = el; }}
                                data-testid={`create-task-item-input-${index}`}
                                placeholder="List item"
                                value={item}
                                onChange={(e) => updateItem(index, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addItemAfter(index);
                                    };
                                }}
                                className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-400"
                            />
                            {items.length > 1 && (
                                <button
    type="button"
    data-testid={`edit-task-item-remove-${index}`}
    onClick={() => removeItemRow(index)}
    aria-label="Remove item"
    className="cursor-pointer text-zinc-500 hover:text-zinc-300"
>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
    >
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
</button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        data-testid="create-task-add-item-button"
                        onClick={() => addItemAfter(items.length - 1)}
                        className="cursor-pointer self-start mt-1 text-xs text-zinc-500 hover:text-zinc-300"
                    >
                        + List item
                    </button>
                </div>
            )}

            {isExpanded && (
                <>
                {error && (
                    <p data-testid="create-task-error" className="mt-2 text-xs text-red-400">
                        {error}
                    </p>
                )}

                <div className="mt-3 flex justify-end gap-2 border-t border-zinc-700 pt-2">
                    <button
                        type="button"
                        data-testid="create-task-cancel-button"
                        onClick={resetAndCollapse}
                        className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        data-testid="create-task-submit-button"
                        disabled={isSubmitting || !hasContent }
                        className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                        {isSubmitting ? "Adding..." : "Done"}
                    </button>
                </div>
                </>
            )}
        </form>
    );
}