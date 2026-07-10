import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from './+types/_main.transaction';
import { HeroBanner } from '../components/home/HeroBanner';
import { EventTitleHeader } from '../components/order/EventTitleHeader';
import { SelectEventFirstModal } from '../components/order/SelectEventFirstModal';
import { OrderListItem } from '../components/transaction/OrderListItem';
import { SoldProductListItem } from '../components/transaction/SoldProductListItem';
import {
    TransactionFilterChips,
    type TransactionView,
} from '../components/transaction/TransactionFilterChips';
import { useAppStore } from '../stores/app-store';
import type { TransactionsResponse } from '../types/order';

export async function clientLoader() {
    const activeEvent = useAppStore.getState().activeEvent;
    if (!activeEvent) return null;

    const res = await fetch(`/api/orders?eventId=${activeEvent.id}`, { credentials: 'include' });

    if (!res.ok) {
        throw new Response('Failed to load transactions', { status: res.status });
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
        throw new Response(
            'Orders API unavailable. Restart Wrangler (pnpm dev:wrangler) to load new API routes.',
            { status: 502 },
        );
    }

    return (await res.json()) as TransactionsResponse;
}

clientLoader.hydrate = true as const;

function formatOrderTime(createdAt: string): string {
    return new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TransactionPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const activeEvent = useAppStore((s) => s.activeEvent);
    const [view, setView] = useState<TransactionView>('orders');

    const displayedProducts = useMemo(() => {
        if (!loaderData) return [];
        if (view === 'top5') return loaderData.products.slice(0, 5);
        if (view === 'top10') return loaderData.products.slice(0, 10);
        return loaderData.products;
    }, [loaderData, view]);

    if (!activeEvent) {
        return <SelectEventFirstModal onDismiss={() => navigate('/')} />;
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <EventTitleHeader eventName={activeEvent.name} />
            <HeroBanner />
            <TransactionFilterChips view={view} onViewChange={setView} />
            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
                {!loaderData && (
                    <p className="px-4 py-8 text-center text-sm text-on-surface-variant">
                        Loading transactions…
                    </p>
                )}
                {loaderData && view === 'orders' && loaderData.orders.length === 0 && (
                    <p className="px-4 py-8 text-center text-sm text-on-surface-variant">
                        No orders yet
                    </p>
                )}
                {loaderData && view !== 'orders' && displayedProducts.length === 0 && (
                    <p className="px-4 py-8 text-center text-sm text-on-surface-variant">
                        No products sold yet
                    </p>
                )}
                {loaderData && view === 'orders' && loaderData.orders.length > 0 && (
                    <ul>
                        {loaderData.orders.map((order, idx) => (
                            <OrderListItem
                                key={order.id}
                                orderNumber={loaderData.orders.length - idx}
                                time={formatOrderTime(order.createdAt)}
                                itemCount={order.totalProductSold}
                                totalIncome={order.totalIncome}
                                currencyCode={loaderData.currencyCode}
                            />
                        ))}
                    </ul>
                )}
                {loaderData && view !== 'orders' && displayedProducts.length > 0 && (
                    <ul>
                        {displayedProducts.map((product) => (
                            <SoldProductListItem
                                key={product.productId}
                                product={product}
                                currencyCode={loaderData.currencyCode}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
