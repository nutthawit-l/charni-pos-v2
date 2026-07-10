import { CenteredModal } from '../CenteredModal';

interface DeleteProductModalProps {
    open: boolean;
    isDeleting: boolean;
    error: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteProductModal({
    open,
    isDeleting,
    error,
    onConfirm,
    onCancel,
}: DeleteProductModalProps) {
    return (
        <CenteredModal
            open={open}
            onBackdropClick={onCancel}
            backdropDisabled={isDeleting}
            role="alertdialog"
            ariaLabelledBy="delete-product-title"
            panelClassName="px-6 py-8"
        >
            <h2
                id="delete-product-title"
                className="text-center text-xl font-medium text-on-surface"
            >
                Delete this product?
            </h2>

            {error && (
                <p className="mt-4 text-center text-sm text-red-600">{error}</p>
            )}

            <div className="mt-6 flex flex-col gap-3">
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="w-full rounded-full bg-red-600 px-6 py-3 text-sm font-medium text-white disabled:opacity-40"
                >
                    {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="w-full rounded-full bg-surface-container px-6 py-3 text-sm font-medium text-on-surface-variant disabled:opacity-40"
                >
                    Cancel
                </button>
            </div>
        </CenteredModal>
    );
}
