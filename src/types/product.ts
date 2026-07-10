export const SUPPORTED_CURRENCIES = ["THB", "SGD", "USD", "JPY"] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export interface CategorySummary {
    id: number;
    name: string;
}

export interface ProductSummary {
    id: number;
    name: string;
    categoryId: number | null;
    categoryName: string | null;
    imageUrl: string;
    price: number;
    stock: number;
}

export interface ProductsResponse {
    shopName: string;
    currencyCode: string;
    categories: CategorySummary[];
    products: ProductSummary[];
}

export interface StockUpdateRequest {
    items: { productId: number; stock: number }[];
}

export interface ProductDetailResponse {
    id: number;
    name: string;
    categoryId: number | null;
    imageUrl: string;
    stock: number;
    prices: Record<CurrencyCode, number | null>;
    categories: CategorySummary[];
}

export interface ProductUpdateRequest {
    name: string;
    categoryId: number | null;
    stock: number;
    imageUrl: string;
    prices: Partial<Record<CurrencyCode, number>>;
}

export interface CreateCategoryRequest {
    name: string;
}

export type CreateCategoryResponse = CategorySummary;
