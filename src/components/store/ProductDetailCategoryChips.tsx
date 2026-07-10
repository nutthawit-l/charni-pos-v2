import { Check, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CategorySummary } from '../../types/product';

interface ProductDetailCategoryChipsProps {
    categories: CategorySummary[];
    selectedCategoryId: number | null;
    onSelect: (categoryId: number) => void;
    onCreateCategory: () => void;
}

export function ProductDetailCategoryChips({
    categories,
    selectedCategoryId,
    onSelect,
    onCreateCategory,
}: ProductDetailCategoryChipsProps) {
    return (
        <div className="flex w-full min-w-0 flex-nowrap gap-1 overflow-x-auto px-2 py-2 no-scrollbar">
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
            <button
                type="button"
                onClick={onCreateCategory}
                aria-label="Create category"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant"
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
}
