import { ChevronRight } from 'lucide-react';
import type { EventSummary } from '../../types/event';
import { EventListItem } from './EventListItem';

interface EventsSectionProps {
    events: EventSummary[];
    onEventSelect: (event: EventSummary) => void;
}

export function EventsSection({ events, onEventSelect }: EventsSectionProps) {
    return (
        <section className="px-4 pt-6">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-medium text-on-surface">Events</h2>
                <ChevronRight className="h-5 w-5 text-on-surface-variant" />
            </div>
            {events.length === 0 ? (
                <p className="py-8 text-center text-sm text-on-surface-variant">No events yet</p>
            ) : (
                <ul>
                    {events.map((event) => (
                        <EventListItem
                            key={event.id}
                            event={event}
                            onClick={() => onEventSelect(event)}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}
