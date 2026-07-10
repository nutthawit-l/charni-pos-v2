import { useState } from 'react';
import type { Route } from './+types/_main._index';
import { AppBar } from '../components/home/AppBar';
import { EventActionModal } from '../components/home/EventActionModal';
import { HeroBanner } from '../components/home/HeroBanner';
import { EventsSection } from '../components/home/EventsSection';
import { NewEventButton } from '../components/home/NewEventButton';
import type { EventSummary } from '../types/event';

interface UserProfile {
    id: number;
    displayName: string;
    avatarUrl: string | null;
}

export async function clientLoader() {
    const [profileRes, eventsRes] = await Promise.all([
        fetch('/api/users/profile', { credentials: 'include' }),
        fetch('/api/events', { credentials: 'include' }),
    ]);
    
    if (!profileRes.ok) {
        throw new Response('Unauthorized', { status: profileRes.status });
    }
    if (!eventsRes.ok) {
        throw new Response('Failed to fetch events', { status: eventsRes.status });
    }
    
    const user = (await profileRes.json()) as UserProfile;
    const events = (await eventsRes.json()) as EventSummary[];
    
    return { user, events };
}

clientLoader.hydrate = true as const;

export default function HomePage({ loaderData }: Route.ComponentProps) {
    const { user, events } = loaderData;
    const [selectedEvent, setSelectedEvent] = useState<EventSummary | null>(null);

    return (
        <>
            <AppBar displayName={user.displayName} avatarUrl={user.avatarUrl} />
            <HeroBanner />
            <EventsSection events={events} onEventSelect={setSelectedEvent} />
            <NewEventButton />
            {selectedEvent && (
                <EventActionModal
                    event={selectedEvent}
                    open
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </>
    );
}