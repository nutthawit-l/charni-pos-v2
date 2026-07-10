export interface TransactionOrder {
    id: number;
    totalIncome: number;
    totalProductSold: number;
    createdAt: string;
}

export interface SoldProductSummary {
    productId: number;
    productName: string;
    imageUrl: string;
    categoryName: string | null;
    price: number;
    totalSold: number;
}

export interface TransactionsResponse {
    currencyCode: string;
    orders: TransactionOrder[];
    products: SoldProductSummary[];
}
