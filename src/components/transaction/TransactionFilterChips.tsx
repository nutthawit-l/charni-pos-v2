import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export type TransactionView = 'orders' | 'allItems' | 'top5' | 'top10';

const VIEWS: { value: TransactionView; label: string }[] = [
    { value: 'orders', label: 'Order by order' },
    { value: 'allItems', label: 'All items' },
    { value: 'top5', label: 'Top 5' },
    { value: 'top10', label: 'Top 10' },
];

interface TransactionFilterChipsProps {
    view: TransactionView;
    onViewChange: (view: TransactionView) => void;
}

export function TransactionFilterChips({ view, onViewChange }: TransactionFilterChipsProps) {
    return (
        <div className="flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto px-2 py-2 no-scrollbar">
            {VIEWS.map(({ value, label }) => {
                const selected = view === value;
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onViewChange(value)}
                        className={cn(
                            'flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium',
                            selected
                                ? 'border-outline-variant bg-secondary-container text-on-secondary-container'
                                : 'border-outline-variant text-on-surface-variant',
                        )}
                    >
                        {selected && <Check className="h-4 w-4" />}
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
