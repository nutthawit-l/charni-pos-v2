import { normalizeImageUrl } from '../../lib/image-url';
import type { SoldProductSummary } from '../../types/order';

interface SoldProductListItemProps {
    product: SoldProductSummary;
    currencyCode: string;
}

export function SoldProductListItem({ product, currencyCode }: SoldProductListItemProps) {
    const soldLabel = product.totalSold === 1 ? '1 Sold' : `${product.totalSold} Sold`;

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
                <p className="truncate text-base text-on-surface">{product.productName}</p>
                <p className="text-sm text-on-surface-variant">
                    {product.price} {currencyCode}
                </p>
            </div>
            <p className="shrink-0 text-sm font-medium text-on-surface">{soldLabel}</p>
        </li>
    );
}
