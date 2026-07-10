import type { ProductSummary } from '../../types/product';
import { StoreProductListItem } from './StoreProductListItem';

interface StoreProductListProps {
    products: ProductSummary[];
    stockDrafts: Record<number, number>;
    onSelectProduct: (productId: number) => void;
    onIncrementStock: (productId: number) => void;
    onDecrementStock: (productId: number) => void;
}

export function StoreProductList({
    products,
    stockDrafts,
    onSelectProduct,
    onIncrementStock,
    onDecrementStock,
}: StoreProductListProps) {
    if (products.length === 0) {
        return (
            <p className="px-4 py-8 text-center text-sm text-on-surface-variant">
                No products
            </p>
        );
    }

    return (
        <ul>
            {products.map((product) => (
                <StoreProductListItem
                    key={product.id}
                    product={product}
                    stock={stockDrafts[product.id]}
                    onSelect={() => onSelectProduct(product.id)}
                    onIncrementStock={() => onIncrementStock(product.id)}
                    onDecrementStock={() => onDecrementStock(product.id)}
                />
            ))}
        </ul>
    );
}
