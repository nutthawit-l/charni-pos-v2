import { create } from 'zustand';
import type { EventSummary } from '../types/event';

interface AppState {
    activeEvent: EventSummary | null;
    quantities: Record<number, number>;

    setActiveEvent: (event: EventSummary) => void;
}

export const useAppStore = create<AppState>((set) => ({
    activeEvent: null,
    quantities: {},

    setActiveEvent: (event) =>
        set((s) => ({
            activeEvent: event,
            quantities: s.activeEvent?.id === event.id ? s.quantities : {},
        })),
}));
