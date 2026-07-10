import { CenteredModal } from '../CenteredModal';

export interface CheckoutLineItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
}

interface CheckoutConfirmationModalProps {
    open: boolean;
    items: CheckoutLineItem[];
    currencyCode: string;
    isSubmitting: boolean;
    error: string | null;
    onConfirm: () => void;
    onCancel: () => void;
    onUpdateItems: () => void;
}

export function CheckoutConfirmationModal({
    open,
    items,
    currencyCode,
    isSubmitting,
    error,
    onConfirm,
    onCancel,
    onUpdateItems,
}: CheckoutConfirmationModalProps) {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CenteredModal
            open={open}
            onBackdropClick={onUpdateItems}
            backdropDisabled={isSubmitting}
            ariaLabelledBy="checkout-summary-title"
            panelClassName="flex max-h-[85vh] flex-col overflow-hidden"
        >
            <div className="shrink-0 border-b border-outline-variant px-6 py-4 text-center">
                <h2
                    id="checkout-summary-title"
                    className="text-xl font-medium text-on-surface"
                >
                    Order summary
                </h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
                <ul className="space-y-3">
                    {items.map((item) => (
                        <li key={item.id}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-on-surface">
                                        {item.name}
                                    </p>
                                    <p className="mt-0.5 text-xs text-on-surface-variant">
                                        {item.quantity} × {item.price} {currencyCode}
                                    </p>
                                </div>
                                <p className="shrink-0 text-sm font-medium text-on-surface">
                                    {item.price * item.quantity} {currencyCode}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="shrink-0 border-t border-outline-variant bg-surface px-6 py-6">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-base font-medium text-on-surface">Total</span>
                    <span className="text-xl font-medium text-primary">
                        {total} {currencyCode}
                    </span>
                </div>

                {error && (
                    <p className="mb-4 text-center text-sm text-red-600">{error}</p>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary disabled:opacity-40"
                    >
                        {isSubmitting ? 'Processing…' : 'Confirm payment'}
                    </button>
                    <button
                        type="button"
                        onClick={onUpdateItems}
                        disabled={isSubmitting}
                        className="w-full rounded-full bg-surface-container px-6 py-3 text-sm font-medium text-on-surface-variant disabled:opacity-40"
                    >
                        Update items
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="w-full rounded-full bg-surface-container px-6 py-3 text-sm font-medium text-on-surface-variant disabled:opacity-40"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </CenteredModal>
    );
}
