"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

interface TaskItemType {
    id: number;
    text: string;
    completed: boolean;
}

interface Task {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    isChecklist: boolean;
    items: TaskItemType[];
}

export function TaskItem({ task } : { task: Task }) {

    const router = useRouter();

    const editRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLInputElement | null)[]>([]);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? "");
    const [items, setItems] = useState<{ id: number | null; text: string; completed: boolean }[]>(
        task.items.map((item) => ({ id: item.id, text: item.text, completed: item.completed }))
    );
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setItems(task.items.map((item) => ({ id: item.id, text: item.text, completed: item.completed })));
            setTitle(task.title);
            setDescription(task.description ?? "");
        };
    }, [isOpen, task]);

    const originalDescription = task.description ?? "";
    const hasItemsChanged = () => {
        if (task.items.length !== items.length) return true;
        return items.some((item, index) => item.text !== task.items[index]?.text);
    };

    const isDirty = 
        title !== task.title || 
        (task.isChecklist ? hasItemsChanged() : description !== originalDescription);

    const PREVIEW_ITEM_LIMIT = 5;

    const cancelEdit = () => {
        setIsOpen(false);
        setError("");
    };

    const adjustDescriptionHeight = () => {
        if (!descriptionRef.current) return;

        descriptionRef.current.style.height = "auto";
        descriptionRef.current.style.height = `${Math.min(
            descriptionRef.current.scrollHeight,
            400
        )}px`;
    };

    useEffect(() => {
        if (isOpen && !task.isChecklist) {
            setTimeout(adjustDescriptionHeight, 0);
        }
    }, [isOpen, description, task.isChecklist]);

    useEffect(() => {
        
        if (!isOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (editRef.current && !editRef.current.contains(event.target as Node)) {
                cancelEdit();
            };
        };

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                cancelEdit();
            };
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, title, description])

    const handleSave = async () => {

        if(!isDirty) return;
        setError("");

        try {
            const taskResponse = await fetch(`/api/tasks/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description: task.isChecklist ? null : description
                }),
            });

            if (!taskResponse.ok) {
                const body = await taskResponse.json();
                setError(body.errors?.[0] || body.error || "Failed to save task");
                return;
            };

            if (task.isChecklist) {
                
                const promises: Promise<Response>[] = [];

                const newItemsWithText = items.filter(
                    item => item.id === null && item.text.trim().length > 0
                );

                newItemsWithText.forEach(item => {
                    promises.push(
                        fetch(`/api/tasks/${task.id}/items`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: item.text.trim() })
                        })
                    );
                });

                items.forEach(item => {
                    if (item.id === null) return;

                    const originalItem = task.items.find(t => t.id === item.id);
                    if (!originalItem) return;

                    const trimmedText = item.text.trim();

                    if (trimmedText.length === 0) {
                        promises.push(
                            fetch(`/api/tasks/${task.id}/items/${item.id}`, { method: "DELETE" })
                        );
                    } else if (originalItem.text !== trimmedText) {
                        promises.push(
                            fetch(`/api/tasks/${task.id}/items/${item.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ text: trimmedText })
                            })
                        );
                    }
                });

                const deletedItems = task.items.filter(
                    originalItem => !items.some(currentItem => currentItem.id === originalItem.id)
                );
                deletedItems.forEach(item => {
                    promises.push(
                        fetch(`/api/tasks/${task.id}/items/${item.id}`, { method: "DELETE" })
                    );
                });

                const results = await Promise.all(promises);
                const failedRequest = results.find(response => !response.ok);
                if (failedRequest) {
                    throw new Error("Failed to save checklist items");
                };
            }

            setIsOpen(false);
            router.refresh();

        } catch (error) {
            console.error("Error saving task changes:", error);
            setError("Something went wrong while saving");
        };
    };

    const handleDelete = async () => {

        const response = await fetch(`/api/tasks/${task.id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            console.error("Failed to delete task:", await response.text());
            return;
        };
        
        setShowDeleteConfirm(false);
        router.refresh();
    };

    const handleToggleItem = async (itemId: number, currentlyCompleted: boolean) => {
        
        const response = await fetch(`/api/tasks/${task.id}/items/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !currentlyCompleted }),
        });

        if (!response.ok) {
            console.error("Failed to toggle item:", await response.text());
            return;
        }

        router.refresh();
    };

    const handleToggleItemInEdit = async (itemId: number | null, index: number) => {
        if (itemId === null) return;

        const currentlyCompleted = items[index].completed;

        const response = await fetch(`/api/tasks/${task.id}/items/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !currentlyCompleted }),
        });

        if (!response.ok) {
            console.error("Failed to toggle item:", await response.text());
            return;
        }

        setItems((prev) =>
            prev.map((item, i) => (i === index ? { ...item, completed: !currentlyCompleted } : item))
        );
    };

    const updateItem = (index: number, value: string) => {
        setItems((prev) => prev.map((item, i) => (i === index ? { ...item, text: value } : item)));
    };

    const addItemAfter = (index: number) => {
        setItems((prev) => {
            const next = [...prev];
            next.splice(index + 1, 0, {
                id: null, text: "",
                completed: false
            });
            return next;
        });
        setTimeout(() => itemRefs.current[index + 1]?.focus(), 0);
    };

    const removeItemRow = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    if (isOpen) {
        return (
            <div
                data-testid="task-modal-overlay"
                onClick={cancelEdit}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            >
                <div
                    ref={editRef}
                    data-testid="task-item"
                    data-task-title={task.title}
                    onClick={(e) => e.stopPropagation()}
                    className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-zinc-700 bg-zinc-800 p-5"
                >
                    <input
                        data-testid="task-edit-title-input"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent text-base font-semibold text-zinc-100 outline-none"
                        autoFocus
                    />
                    {task.isChecklist === true ? (
                        <div data-testid="edit-task-items-list" className="mt-2 max-h-[60vh] overflow-y-auto pr-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        data-testid={`edit-task-item-toggle-${index}`}
                                        onClick={() => handleToggleItemInEdit(item.id, index)}
                                        disabled={item.id === null}
                                        className={`h-4 w-4 flex-shrink-0 cursor-pointer rounded border transition-colors ${
                                            item.completed
                                            ? "border-zinc-400 bg-zinc-400"
                                            : "border-zinc-500 bg-transparent hover:border-zinc-300"
                                        } disabled:cursor-not-allowed disabled:opacity-40`}
                                        aria-label="Toggle item completed"
                                    />
                                    <input
                                        ref={(el) => { itemRefs.current[index] = el; }}
                                        data-testid={`edit-task-item-input-${index}`}
                                        placeholder="List item"
                                        value={item.text}
                                        onChange={(e) => updateItem(index, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addItemAfter(index);
                                            }
                                        }}
                                        className={`w-full bg-transparent text-sm outline-none placeholder:text-zinc-500 ${
                                            item.completed
                                                ? "text-zinc-600 line-through"
                                                : "text-zinc-200"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        data-testid={`edit-task-item-remove-${index}`}
                                        onClick={() => removeItemRow(index)}
                                        aria-label="Remove item"
                                        className="cursor-pointer text-zinc-500 hover:text-zinc-300"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                data-testid="edit-task-add-item-button"
                                onClick={() => addItemAfter(items.length - 1)}
                                className="cursor-pointer self-start text-xs text-zinc-500 hover:text-zinc-300"
                            >
                                + List item
                            </button>
                        </div>
                    ) : (
                        <div className="mt-2 min-h-0 overflow-y-auto">
                            <textarea
                                ref={descriptionRef}
                                data-testid="task-edit-description-input"
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    adjustDescriptionHeight();
                                }}
                                rows={2}
                                className="w-full max-h-[400px] resize-none overflow-y-auto bg-transparent text-sm text-zinc-300 outline-none"
                            />
                        </div>
                    )}

                    {error && (
                        <p data-testid="task-edit-error" className="mt-2 text-xs text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="mt-3 flex justify-end gap-3">
                        <button
                            type="button"
                            data-testid="task-cancel-edit-button"
                            onClick={cancelEdit}
                            className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            data-testid="task-save-button"
                            onClick={handleSave}
                            disabled={!isDirty}
                            className="cursor-pointer rounded-lg border border-blue-900 px-3 py-1 text-xs font-medium text-blue-400 hover:bg-blue-950 hover:text-blue-300 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:text-zinc-600 disabled:hover:bg-transparent"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
        <div
            data-testid="task-item"
            data-task-title={task.title}
            onClick={() => setIsOpen(true)}
            className="cursor-pointer group relative mb-4 break-inside-avoid rounded-xl border border-zinc-700 bg-zinc-800 p-4 transition-colors hover:border-zinc-600"
        >
            <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                    <h3
                        data-testid="task-title"
                        className={`break-words text-base font-semibold text-zinc-100 ${
                            task.completed ? "text-zinc-500 line-through" : ""
                        }`}
                    >
                        {task.title}
                    </h3>
                    {task.description && (
                        <p
                            className={`line-clamp-4 mt-2 break-words text-sm text-zinc-400 ${
                                task.completed ? "text-zinc-600 line-through" : ""
                            }`}
                        >
                            {task.description}
                        </p>
                    )}
                    {task.items.length > 0 && (
                        <ul data-testid="checklist-preview" className="mt-2 flex flex-col gap-1">
                            {task.items.slice(0, PREVIEW_ITEM_LIMIT).map((item) => (
                                <li key={item.id} data-testid="checklist-item" className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        data-testid="checklist-item-toggle"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleItem(item.id, item.completed);
                                        }}                                      
                                        className={`h-4 w-4 flex-shrink-0 cursor-pointer rounded border transition-colors ${
                                            item.completed
                                            ? "border-zinc-400 bg-zinc-400"
                                            : "border-zinc-500 bg-transparent hover:border-zinc-300"
                                        }`}
                                        aria-label="Toggle item completed"
                                    />
                                    <span
                                        className={`truncate text-sm text-zinc-300 ${
                                            item.completed ? "text-zinc-600 line-through" : ""
                                        }`}
                                    >
                                        {item.text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {task.items.length > PREVIEW_ITEM_LIMIT && (
                        <ul>
                            <li className="text-xs mt-2 text-zinc-500">
                                +{task.items.length - PREVIEW_ITEM_LIMIT} more
                            </li>
                        </ul>
                    )}
                </div>
            </div>

            <div className="mt-3 flex justify-end gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    type="button"
                    data-testid="delete-task-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                    }}
                    className="cursor-pointer text-zinc-400/90 hover:text-red-400 transition-colors duration-150"
                    aria-label="Delete task"
                >
                    <svg 
                        xmlns="http://w3.org" 
                        className="w-4.5 h-4.5" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>

        </div>
        
        {showDeleteConfirm && (
            <DeleteConfirmModal
            taskTitle={task.title}
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteConfirm(false)}
            />
        )}
        </>
    );
};