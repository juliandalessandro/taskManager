"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function CreateTaskForm() {

    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetAndCollapse = () => {
        setTitle("");
        setDescription("");
        setError("");
        setIsExpanded(false);
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

        if (!title.trim()) {
            resetAndCollapse();
            return;
        };

        setError("");
        setIsSubmitting(true);

        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description: description || undefined }),
        });

        setIsSubmitting(false);

        if (!response.ok) {
            const body = await response.json();
            setError(body.errors?.[0] || body.error || "Failed to create task");
            return;
        };

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
            <input
                data-testid="create-task-title-input"
                placeholder="Take a note..."
                value={title}
                onFocus={() => setIsExpanded(true)}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            />

            {isExpanded && (
                <>
                    <textarea
                        data-testid="create-task-description-input"
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="mt-2 w-full resize-none bg-transparent text-sm text-zinc-300 outline-none placeholder:text-zinc-500"
                    />

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
                            disabled={isSubmitting}
                            className="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700 disabled:opacity-60"
                        >
                            {isSubmitting ? "Adding..." : "Done"}
                        </button>
                    </div>
                </>
            )}
        </form>
    )
}