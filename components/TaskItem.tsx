"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


interface Task {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
}

export function TaskItem({ task } : { task: Task }) {

    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? "");

    const handleSave = async () => {

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
        }
        
        router.refresh();
    }

    if (isEditing) {

        return (
            <div
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
                        onClick={() => setIsEditing(false)}
                        className="text-sm text-zinc-400 hover:text-zinc-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        data-testid="task-save-button"
                        onClick={handleSave}
                        className="text-sm font-medium text-zinc-100 hover:text-white"
                    >
                        Save
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div
            data-testid="task-item"
            className="group relative mb-4 break-inside-avoid rounded-xl border border-zinc-700 bg-zinc-800 p-4 transition-colors hover:border-zinc-600"
        >
            <div className="flex items-start gap-3">
                <button 
                    type="button"
                    data-testid="task-toggle-complete-button"
                    className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border transition-colors ${
                        task.completed
                        ? "border-zinc-400 bg-zinc-400"
                        : "border-zinc-500 bg-transparent hover:border-zinc-300"
                    }`}
                    onClick={handleToggleComplete}
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
                    className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                    Edit
                </button>
                <button
                    type="button"
                    data-testid="task-delete-button"
                    onClick={handleDelete}
                    className="text-xs text-zinc-400 hover:text-red-400"
                >
                    Delete
                </button>          
            </div>
        </div>
    )
};