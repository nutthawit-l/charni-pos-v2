import { Fragment, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from './+types/_main.transaction';
import { HeroBanner } from '../components/home/HeroBanner';
import { TitleHeader } from '../components/TitleHeader';
import { SelectEventFirstModal } from '../components/order/SelectEventFirstModal';
import { OrderListItem } from '../components/transaction/OrderListItem';
import { SoldProductListItem } from '../components/transaction/SoldProductListItem';
import {
    TransactionFilterChips,
    type TransactionView,
} from '../components/transaction/TransactionFilterChips';
import { useAppStore } from '../stores/app-store';
import type { TransactionsResponse } from '../types/order';
import { LeftDivider } from '../components/LeftDivider';

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

function dayKey(createdAt: string): string {
    const d = new Date(createdAt);
    // Local date bucket -- not UTC -- so evening orders stay on the correct day
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;  // e.g. "2026-07-15"
}

function formatDayLabel(createdAt: string): string {
    return new Date(createdAt).toLocaleDateString([], { weekday: 'long' });
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
    
    const orderDayGroups = useMemo(() => {
        if (!loaderData) return [];
        
        const total = loaderData.orders.length;
        let globalIdx = 0;
        
        const groups: { 
            key: string; 
            label: string; 
            items: { order: (typeof loaderData.orders)[number]; orderNumber: number }[];
        }[] = [];
        
        for (const order of loaderData.orders) {
            const key = dayKey(order.createdAt);
            const item = {
                order,
                orderNumber: total - globalIdx,
            };
            globalIdx += 1;

            const last = groups[groups.length - 1];
            if (last && last.key === key) {
                last.items.push(item);
            } else {
                groups.push({
                    key,
                    label: formatDayLabel(order.createdAt),
                    items: [item],
                });
            }
        }
        
        return groups;
    }, [loaderData]);

    if (!activeEvent) {
        return <SelectEventFirstModal onDismiss={() => navigate('/')} />;
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <TitleHeader title={activeEvent.name} />
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
                        {orderDayGroups.map((group) => (
                            <Fragment key={group.key}>
                                <li>
                                    <LeftDivider label={group.label} />
                                </li>
                                {group.items.map(({ order, orderNumber }) => (
                                    <OrderListItem 
                                        key={order.id} 
                                        orderNumber={orderNumber}
                                        time={formatOrderTime(order.createdAt)}
                                        itemCount={order.totalProductSold}
                                        totalIncome={order.totalIncome}
                                        currencyCode={loaderData.currencyCode}
                                    />
                                ))}
                            </Fragment>
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
