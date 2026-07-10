import { ChevronRight } from 'lucide-react';
import { formatEventDatetime } from '../../lib/format-event-datetime';
import type { EventSummary } from '../../types/event';

interface EventListItemProps {
    event: EventSummary;
    onClick: () => void;
}

export function EventListItem({ event, onClick }: EventListItemProps) {
    return (
        <li className="border-b border-outline-variant last:border-b-0">
            <button
                type="button"
                onClick={onClick}
                className="flex w-full items-center gap-3 py-4 text-left"
            >
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                        {event.country}
                    </p>
                    <p className="truncate text-base font-medium text-on-surface">{event.name}</p>
                    <p className="text-sm text-on-surface-variant">
                        {formatEventDatetime(event.startAt, event.country)}
                    </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant" />
            </button>
        </li>
    );
}
