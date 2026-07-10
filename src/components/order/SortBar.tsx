import { ArrowUpDown, List } from 'lucide-react';

export type SortDirection = 'asc' | 'desc';

interface SortBarProps {
    sortDirection: SortDirection;
    onToggleSort: () => void;
}

export function SortBar({ sortDirection, onToggleSort }: SortBarProps) {
    return (
        <div className="flex items-center justify-between px-2 py-2">
            <button
                type="button"
                onClick={onToggleSort}
                className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-primary"
            >
                <ArrowUpDown className="h-4 w-4" />
                Cost
                <span className="sr-only">
                    {sortDirection === 'asc' ? 'ascending' : 'descending'}
                </span>
            </button>
            <button
                type="button"
                aria-label="List view"
                disabled
                className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant disabled:opacity-40"
            >
                <List className="h-5 w-5" />
            </button>
        </div>
    );
}
