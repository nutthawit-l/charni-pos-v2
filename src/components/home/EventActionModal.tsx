import { useNavigate } from 'react-router';
import { X } from 'lucide-react';
import { formatEventDatetime } from '../../lib/format-event-datetime';
import { useAppStore } from '../../stores/app-store';
import type { EventSummary } from '../../types/event';

interface EventActionModalProps {
    event: EventSummary;
    open: boolean;
    onClose: () => void;
}

export function EventActionModal({ event, open, onClose }: EventActionModalProps) {
    const navigate = useNavigate();
    const setActiveEvent = useAppStore((s) => s.setActiveEvent);

    if (!open) return null;

    function handleOrder() {
        setActiveEvent(event);
        onClose();
        navigate('/order');
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 px-4"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="w-full max-w-[400px] rounded-[28px] bg-surface px-4 py-6"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="event-action-title"
            >
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                            {event.country}
                        </p>
                        <h2
                            id="event-action-title"
                            className="mt-1 text-2xl font-normal text-on-surface"
                        >
                            {event.name}
                        </h2>
                        <p className="mt-1 text-sm text-on-surface-variant">
                            {formatEventDatetime(event.startAt, event.country)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={handleOrder}
                    className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary"
                >
                    Start Your Order
                </button>
            </div>
        </div>
    );
}
