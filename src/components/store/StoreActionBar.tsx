interface StoreActionBarProps {
    hasChanges: boolean;
    isSaving: boolean;
    onSave: () => void;
}

export function StoreActionBar({ hasChanges, isSaving, onSave }: StoreActionBarProps) {
    return (
        <div className="flex shrink-0 gap-4 border-t border-outline-variant bg-surface px-2 py-4">
            <button
                type="button"
                disabled
                className="flex-1 rounded-full bg-surface-container px-6 py-3 text-sm font-medium text-on-surface-variant disabled:opacity-40"
            >
                New Product
            </button>
            <button
                type="button"
                onClick={onSave}
                disabled={!hasChanges || isSaving}
                className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary disabled:opacity-40"
            >
                Save
            </button>
        </div>
    );
}
