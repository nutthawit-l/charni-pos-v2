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
