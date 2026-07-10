import { Minus, Plus } from 'lucide-react';
import { normalizeImageUrl } from '../../lib/image-url';
import { useAppStore } from '../../stores/app-store';
import type { ProductSummary } from '../../types/product';

interface ProductListItemProps {
    product: ProductSummary;
    currencyCode: string;
}

export function ProductListItem({ product, currencyCode }: ProductListItemProps) {
    const quantity = useAppStore((s) => s.quantities[product.id] ?? 0);
    const incrementQuantity = useAppStore((s) => s.incrementQuantity);
    const decrementQuantity = useAppStore((s) => s.decrementQuantity);

    return (
        <li className="flex h-20 items-center gap-2 px-2">
            <img
                src={normalizeImageUrl(product.imageUrl)}
                alt=""
                className="h-16 w-16 shrink-0 rounded-lg bg-surface-container object-cover"
            />
            <div className="min-w-0 flex-1">
                {product.categoryName && (
                    <p className="text-xs text-on-surface-variant">{product.categoryName}</p>
                )}
                <p className="truncate text-base text-on-surface">{product.name}</p>
                <p className="text-sm text-on-surface-variant">
                    {product.price} {currencyCode}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    onClick={() => decrementQuantity(product.id)}
                    aria-label={`Decrease ${product.name} quantity`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant text-on-surface"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-xl font-medium text-on-surface">
                    {quantity}
                </span>
                <button
                    type="button"
                    onClick={() => incrementQuantity(product.id)}
                    aria-label={`Increase ${product.name} quantity`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </li>
    );
}
