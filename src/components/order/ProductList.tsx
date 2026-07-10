import type { ProductSummary } from '../../types/product';
import { ProductListItem } from './ProductListItem';

interface ProductListProps {
    products: ProductSummary[];
    currencyCode: string;
}

export function ProductList({ products, currencyCode }: ProductListProps) {
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
                <ProductListItem
                    key={product.id}
                    product={product}
                    currencyCode={currencyCode}
                />
            ))}
        </ul>
    );
}
