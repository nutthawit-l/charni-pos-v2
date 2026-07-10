import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CategorySummary } from '../../types/product';

interface CategoryFilterChipsProps {
    categories: CategorySummary[];
    selectedCategoryId: number | null;
    onSelect: (categoryId: number | null) => void;
}

export function CategoryFilterChips({
    categories,
    selectedCategoryId,
    onSelect,
}: CategoryFilterChipsProps) {
    return (
        <div className="flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto px-2 py-2 no-scrollbar">
            <button
                type="button"
                onClick={() => onSelect(null)}
                className={cn(
                    'flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium',
                    selectedCategoryId === null
                        ? 'border-outline-variant bg-secondary-container text-on-secondary-container'
                        : 'border-outline-variant text-on-surface-variant',
                )}
            >
                {selectedCategoryId === null && <Check className="h-4 w-4" />}
                All
            </button>
            {categories.map((category) => {
                const selected = selectedCategoryId === category.id;
                return (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => onSelect(category.id)}
                        className={cn(
                            'flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium',
                            selected
                                ? 'border-outline-variant bg-secondary-container text-on-secondary-container'
                                : 'border-outline-variant text-on-surface-variant',
                        )}
                    >
                        {selected && <Check className="h-4 w-4" />}
                        {category.name}
                    </button>
                );
            })}
        </div>
    );
}
