interface OrderListItemProps {
    orderNumber: number;
    time: string;
    itemCount: number;
    totalIncome: number;
    currencyCode: string;
}

export function OrderListItem({
    orderNumber,
    time,
    itemCount,
    totalIncome,
    currencyCode,
}: OrderListItemProps) {
    const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;

    return (
        <li className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-on-surface-variant">{time}</p>
                <p className="text-base text-on-surface">Order #{orderNumber}</p>
                <p className="text-sm text-on-surface-variant">{itemLabel}</p>
            </div>
            <p className="shrink-0 text-sm font-medium text-on-surface">
                ${totalIncome} {currencyCode}
            </p>
        </li>
    );
}
