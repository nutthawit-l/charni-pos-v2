import { Minus, Plus } from 'lucide-react';
import type { ProductSummary } from '../../types/product';

interface StoreProductListItemProps {
    product: ProductSummary;
    stock: number;
    onSelect: () => void;
    onIncrementStock: () => void;
    onDecrementStock: () => void;
}

export function StoreProductListItem({
    product,
    stock,
    onSelect,
    onIncrementStock,
    onDecrementStock,
}: StoreProductListItemProps) {
    return (
        <li className="flex h-20 items-center gap-2 px-2">
            <button
                type="button"
                onClick={onSelect}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
            >
                <img
                    src={product.imageUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg bg-surface-container object-cover"
                />
                <div className="min-w-0 flex-1">
                    {product.categoryName && (
                        <p className="text-xs text-on-surface-variant">{product.categoryName}</p>
                    )}
                    <p className="truncate text-base text-on-surface">{product.name}</p>
                    <p className="text-sm text-on-surface-variant">Stock: {stock}</p>
                </div>
            </button>
            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDecrementStock();
                    }}
                    aria-label={`Decrease ${product.name} stock`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant text-on-surface"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-xl font-medium text-on-surface">
                    {stock}
                </span>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onIncrementStock();
                    }}
                    aria-label={`Increase ${product.name} stock`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </li>
    );
}
