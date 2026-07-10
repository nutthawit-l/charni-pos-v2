interface OrderActionBarProps {
    hasItems: boolean;
    isCheckingOut: boolean;
    onClear: () => void;
    onCheckout: () => void;
}

export function OrderActionBar({
    hasItems,
    isCheckingOut,
    onClear,
    onCheckout,
}: OrderActionBarProps) {
    return (
        <div className="flex shrink-0 gap-4 border-t border-outline-variant bg-surface px-2 py-4">
            <button
                type="button"
                onClick={onClear}
                disabled={!hasItems || isCheckingOut}
                className="flex-1 rounded-full bg-surface-container px-6 py-3 text-sm font-medium text-on-surface-variant disabled:opacity-40"
            >
                Clear
            </button>
            <button
                type="button"
                onClick={onCheckout}
                disabled={!hasItems || isCheckingOut}
                className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary disabled:opacity-40"
            >
                Checkout
            </button>
        </div>
    );
}
