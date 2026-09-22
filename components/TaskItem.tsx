"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";

interface Task {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
}

export function TaskItem({ task } : { task: Task }) {

    const router = useRouter();
    const editRef = useRef<HTMLDivElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? "");

    const originalDescription = task.description ?? "";
    const isDirty = title !== task.title || description !== originalDescription;

    const cancelEdit = () => {
        setTitle(task.title);
        setDescription(originalDescription);
        setIsEditing(false);
    };

    useEffect(() => {
        
        if (!isEditing) return;

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
    }, [isEditing, title, description])

    const handleSave = async () => {

        if(!isDirty) return;

        const response = await fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description }),
        });

        if (!response.ok) {
            console.error("Failed to save task:", await response.text());
            return;
        };

        setIsEditing(false);
        router.refresh();
    };
    
    const handleToggleComplete = async () => {
        
        const response = await fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !task.completed }),
        });

        if (!response.ok) {
            console.error("Failed to toggle task:", await response.text());
            return;
        };

        router.refresh();
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
    }

    if (isEditing) {

        return (
            <div
                ref={editRef}
                data-testid="task-item"
                className="mb-4 break-inside-avoid rounded-xl border border-zinc-700 bg-zinc-800 p-4"
            >
                <input
                    data-testid="task-edit-title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-zinc-100 outline-none"
                    autoFocus
                />
                <textarea 
                    data-testid="task-edit-description-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-2 w-full resize-none bg-transparent text-sm text-zinc-300 outline-none"
                />
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
        )
    }

    return (
        <>
        <div
            data-testid="task-item"
            className="group relative mb-4 break-inside-avoid rounded-xl border border-zinc-700 bg-zinc-800 p-4 transition-colors hover:border-zinc-600"
        >
            <div className="flex items-start gap-3">
                <button
                    type="button"
                    data-testid="task-toggle-complete-button"
                    onClick={handleToggleComplete}
                    className={`mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border transition-colors ${
                        task.completed
                        ? "border-zinc-400 bg-zinc-400"
                        : "border-zinc-500 bg-transparent hover:border-zinc-300"
                    }`}
                    aria-label="Toggle completed"
                />
                <div className="min-w-0 flex-1">
                    <h3
                        data-testid="task-title"
                        className={`break-words font-medium text-zinc-100 ${
                            task.completed ? "text-zinc-500 line-through" : ""
                        }`}
                    >
                        {task.title}
                    </h3>
                    {task.description && (
                        <p
                            className={`mt-1 break-words text-sm text-zinc-400 ${
                                task.completed ? "text-zinc-600 line-through" : ""
                            }`}
                        >
                            {task.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-3 flex justify-end gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    type="button"
                    data-testid="task-edit-button"
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                >
                    Edit
                </button>
                <button
                    type="button"
                    data-testid="task-delete-button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="cursor-pointer rounded-lg border border-red-900/50 px-3 py-1 text-xs text-red-400/90 hover:bg-red-950/40 hover:text-red-300"
                >
                    Delete
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