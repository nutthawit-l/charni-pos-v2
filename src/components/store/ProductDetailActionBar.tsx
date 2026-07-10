interface ProductDetailActionBarProps {
    hasChanges: boolean;
    isSaving: boolean;
    onCancel: () => void;
    onSave: () => void;
}

export function ProductDetailActionBar({
    hasChanges,
    isSaving,
    onCancel,
    onSave,
}: ProductDetailActionBarProps) {
    const saveEnabled = hasChanges && !isSaving;

    return (
        <div className="flex shrink-0 gap-4 border-t border-outline-variant bg-surface px-2 py-4">
            <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary disabled:opacity-40"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={onSave}
                disabled={!saveEnabled}
                className={
                    saveEnabled
                        ? 'flex-1 rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary'
                        : 'flex-1 rounded-full bg-surface-container px-6 py-3 text-sm font-medium text-on-surface-variant'
                }
            >
                {isSaving ? 'Saving…' : 'Save'}
            </button>
        </div>
    );
}
