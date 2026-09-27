"use client";

import { useState } from "react";

interface DeleteConfirmModalProps {
    taskTitle: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteConfirmModal({ taskTitle, onConfirm, onCancel}: DeleteConfirmModalProps) {

    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
        } finally {
            setIsDeleting(false);
        }
    };

    return (

        <div
            data-testid="delete-confirm-modal-overlay"
            onClick={onCancel}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
        >
            <div
                data-testid="delete-confirm-modal"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-800 p-5"
            >
                <h3 data-testid="delete-modal-title" className="text-sm font-medium text-zinc-100">
                    Delete task?
                </h3>
                <p data-testid="delete-modal-message" className="mt-2 text-sm text-zinc-400">
                    "{taskTitle}" will be permanently deleted.
                </p>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        data-testid="cancel-delete-button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        data-testid="confirm-delete-button"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="cursor-pointer rounded-lg border border-red-900/50 px-3 py-1.5 text-sm text-red-400/90 hover:bg-red-950/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    )
}