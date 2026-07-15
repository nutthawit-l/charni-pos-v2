import { useMemo, useState } from 'react';
import { useNavigate, useRevalidator } from 'react-router';
import type { Route } from './+types/_main.order';
import { CategoryFilterChips } from '../components/order/CategoryFilterChips';
import { CheckoutConfirmationModal } from '../components/order/CheckoutConfirmationModal';
import { OrderActionBar } from '../components/order/OrderActionBar';
import { TitleHeader } from '../components/TitleHeader';
import { ProductList } from '../components/order/ProductList';
import { SelectEventFirstModal } from '../components/order/SelectEventFirstModal';
import { SortBar, type SortDirection } from '../components/order/SortBar';
import { currencyForCountry } from '../lib/event-currency';
import { useAppStore } from '../stores/app-store';
import type { ProductsResponse } from '../types/product';

export async function clientLoader() {
    const activeEvent = useAppStore.getState().activeEvent;
    if (!activeEvent) return null;

    const currency = currencyForCountry(activeEvent.country);
    const res = await fetch(`/api/products?currency=${currency}`, { credentials: 'include' });

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

export default function OrderPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { revalidate } = useRevalidator();
    const activeEvent = useAppStore((s) => s.activeEvent);
    const quantities = useAppStore((s) => s.quantities);
    const clearCart = useAppStore((s) => s.clearCart);

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    const hasItems = useMemo(
        () => Object.values(quantities).some((q) => q > 0),
        [quantities],
    );

    const checkoutItems = useMemo(() => {
        if (!loaderData) return [];
        return loaderData.products
            .filter((p) => (quantities[p.id] ?? 0) > 0)
            .map((p) => ({
                id: p.id,
                name: p.name,
                quantity: quantities[p.id],
                price: p.price,
            }));
    }, [loaderData, quantities]);

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

    if (!activeEvent) {
        return <SelectEventFirstModal onDismiss={() => navigate('/')} />;
    }

    function openCheckoutModal() {
        if (!hasItems || isCheckingOut) return;
        setCheckoutError(null);
        setIsCheckoutModalOpen(true);
    }

    function closeCheckoutModal() {
        setIsCheckoutModalOpen(false);
        setCheckoutError(null);
    }

    function handleCancelCheckout() {
        clearCart();
        closeCheckoutModal();
    }

    async function handleConfirmPayment() {
        if (!activeEvent || isCheckingOut) return;

        const items = Object.entries(quantities)
            .filter(([, qty]) => qty > 0)
            .map(([productId, quantity]) => ({
                productId: Number(productId),
                quantity,
            }));

        setIsCheckingOut(true);
        setCheckoutError(null);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: activeEvent.id, items }),
            });

            if (!res.ok) {
                const data = (await res.json()) as { error?: string };
                throw new Error(data.error ?? 'Checkout failed');
            }

            clearCart();
            closeCheckoutModal();
            revalidate();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Checkout failed';
            setCheckoutError(message);
        } finally {
            setIsCheckingOut(false);
        }
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <TitleHeader title={activeEvent.name} />
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
                    <ProductList
                        products={filteredProducts}
                        currencyCode={loaderData.currencyCode}
                    />
                )}
            </div>
            <OrderActionBar
                hasItems={hasItems}
                isCheckingOut={isCheckingOut}
                onClear={clearCart}
                onCheckout={openCheckoutModal}
            />
            {loaderData && (
                <CheckoutConfirmationModal
                    open={isCheckoutModalOpen}
                    items={checkoutItems}
                    currencyCode={loaderData.currencyCode}
                    isSubmitting={isCheckingOut}
                    error={checkoutError}
                    onConfirm={handleConfirmPayment}
                    onCancel={handleCancelCheckout}
                    onUpdateItems={closeCheckoutModal}
                />
            )}
        </div>
    );
}
