"use client";

interface DeleteConfirmModalProps {
    taskTitle: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteConfirmModal({ taskTitle, onConfirm, onCancel}: DeleteConfirmModalProps) {

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
                        className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        data-testid="confirm-delete-button"
                        onClick={onConfirm}
                        className="cursor-pointer rounded-lg border border-red-900/50 px-3 py-1.5 text-sm text-red-400/90 hover:bg-red-950/40 hover:text-red-300"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}