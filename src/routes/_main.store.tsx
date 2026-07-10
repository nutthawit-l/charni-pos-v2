import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutlet, useRevalidator } from 'react-router';
import type { Route } from './+types/_main.store';
import { CategoryFilterChips } from '../components/order/CategoryFilterChips';
import { EventTitleHeader } from '../components/order/EventTitleHeader';
import { SortBar, type SortDirection } from '../components/order/SortBar';
import { StoreActionBar } from '../components/store/StoreActionBar';
import { StoreProductList } from '../components/store/StoreProductList';
import type { ProductsResponse } from '../types/product';

export async function clientLoader() {
    const res = await fetch('/api/products?currency=SGD', { credentials: 'include' });

    if (!res.ok) {
        throw new Response('Failed to load products', { status: res.status });
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
        throw new Response(
            'Products API unavailable. Restart Wrangler (pnpm dev:wrangler) to load new API routes.',
            { status: 502 },
        );
    }

    return (await res.json()) as ProductsResponse;
}

clientLoader.hydrate = true as const;

export default function StorePage({ loaderData }: Route.ComponentProps) {
    const outlet = useOutlet();
    const navigate = useNavigate();
    const { revalidate } = useRevalidator();

    const [stockDrafts, setStockDrafts] = useState<Record<number, number>>({});
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (!loaderData) return;
        const drafts: Record<number, number> = {};
        for (const product of loaderData.products) {
            drafts[product.id] = product.stock;
        }
        setStockDrafts(drafts);
    }, [loaderData]);

    const hasChanges = useMemo(() => {
        if (!loaderData) return false;
        return loaderData.products.some((p) => stockDrafts[p.id] !== p.stock);
    }, [loaderData, stockDrafts]);

    const filteredProducts = useMemo(() => {
        if (!loaderData) return [];
        const filtered =
            selectedCategoryId === null
                ? loaderData.products
                : loaderData.products.filter((p) => p.categoryId === selectedCategoryId);

        return [...filtered].sort((a, b) =>
            sortDirection === 'asc' ? a.price - b.price : b.price - a.price,
        );
    }, [loaderData, selectedCategoryId, sortDirection]);

    if (outlet) return outlet;

    function handleIncrementStock(productId: number) {
        setStockDrafts((prev) => ({
            ...prev,
            [productId]: (prev[productId] ?? 0) + 1,
        }));
    }

    function handleDecrementStock(productId: number) {
        setStockDrafts((prev) => ({
            ...prev,
            [productId]: Math.max(0, (prev[productId] ?? 0) - 1),
        }));
    }

    async function handleSave() {
        if (!loaderData || !hasChanges || isSaving) return;

        const items = loaderData.products
            .filter((p) => stockDrafts[p.id] !== p.stock)
            .map((p) => ({ productId: p.id, stock: stockDrafts[p.id] }));

        setIsSaving(true);
        setSaveError(null);

        try {
            const res = await fetch('/api/products/stock', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            });

            if (!res.ok) {
                const data = (await res.json()) as { error?: string };
                throw new Error(data.error ?? 'Save failed');
            }

            revalidate();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Save failed';
            setSaveError(message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            {loaderData && <EventTitleHeader eventName={loaderData.shopName} />}
            {loaderData && (
                <>
                    <CategoryFilterChips
                        categories={loaderData.categories}
                        selectedCategoryId={selectedCategoryId}
                        onSelect={setSelectedCategoryId}
                    />
                    <SortBar
                        sortDirection={sortDirection}
                        onToggleSort={() =>
                            setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
                        }
                    />
                </>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
                {!loaderData && (
                    <p className="px-4 py-8 text-center text-sm text-on-surface-variant">
                        Loading products…
                    </p>
                )}
                {loaderData && (
                    <StoreProductList
                        products={filteredProducts}
                        stockDrafts={stockDrafts}
                        onSelectProduct={(productId) => navigate(`/store/${productId}`)}
                        onIncrementStock={handleIncrementStock}
                        onDecrementStock={handleDecrementStock}
                    />
                )}
            </div>
            {saveError && (
                <p className="shrink-0 px-4 py-2 text-center text-sm text-red-600">{saveError}</p>
            )}
            <StoreActionBar
                hasChanges={hasChanges}
                isSaving={isSaving}
                onSave={handleSave}
                onNewProduct={() => navigate('/store/new')}
            />
        </div>
    );
}
