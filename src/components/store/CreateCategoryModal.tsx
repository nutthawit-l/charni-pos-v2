import { CenteredModal } from '../CenteredModal';
import { OutlinedTextField } from './OutlinedTextField';

interface CreateCategoryModalProps {
    open: boolean;
    name: string;
    isCreating: boolean;
    error: string | null;
    onNameChange: (name: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export function CreateCategoryModal({
    open,
    name,
    isCreating,
    error,
    onNameChange,
    onConfirm,
    onCancel,
}: CreateCategoryModalProps) {
    const canCreate = name.trim().length > 0 && !isCreating;

    return (
        <CenteredModal
            open={open}
            onBackdropClick={onCancel}
            backdropDisabled={isCreating}
            ariaLabelledBy="create-category-title"
            panelClassName="px-6 py-8"
        >
            <h2
                id="create-category-title"
                className="text-center text-xl font-medium text-on-surface"
            >
                New category
            </h2>

            <div className="mt-6">
                <OutlinedTextField
                    label="Category name"
                    value={name}
                    onChange={onNameChange}
                    disabled={isCreating}
                />
            </div>

            {error && (
                <p className="mt-4 text-center text-sm text-red-600">{error}</p>
            )}

            <div className="mt-6 flex flex-col gap-3">
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={!canCreate}
                    className={
                        canCreate
                            ? 'w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary'
                            : 'w-full rounded-full bg-surface-container px-6 py-3 text-sm font-medium text-on-surface-variant'
                    }
                >
                    {isCreating ? 'Creating…' : 'Create'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isCreating}
                    className="w-full rounded-full bg-surface-container px-6 py-3 text-sm font-medium text-on-surface-variant disabled:opacity-40"
                >
                    Cancel
                </button>
            </div>
        </CenteredModal>
    );
}
