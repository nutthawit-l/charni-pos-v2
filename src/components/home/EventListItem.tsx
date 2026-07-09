import { ChevronRight } from 'lucide-react';
import { formatEventDatetime } from '../../lib/format-event-datetime';
import type { EventSummary } from '../../types/event';

interface EventListItemProps {
    event: EventSummary;
}

export function EventListItem({ event }: EventListItemProps) {
    return (
        <li className="flex items-center gap-3 border-b border-outline-variant py-4 last:border-b-0">
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
        </li>
    );
}
