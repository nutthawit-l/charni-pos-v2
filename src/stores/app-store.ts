import { create } from 'zustand';
import type { EventSummary } from '../types/event';

interface AppState {
    activeEvent: EventSummary | null;
    quantities: Record<number, number>;

    setActiveEvent: (event: EventSummary) => void;
    clearActiveEvent: () => void;
    setQuantity: (productId: number, qty: number) => void;
    incrementQuantity: (productId: number) => void;
    decrementQuantity: (productId: number) => void;
    clearCart: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    activeEvent: null,
    quantities: {},

    setActiveEvent: (event) =>
        set((s) => ({
            activeEvent: event,
            quantities: s.activeEvent?.id === event.id ? s.quantities : {},
        })),

    clearActiveEvent: () => set({ activeEvent: null, quantities: {} }),

    setQuantity: (productId, qty) => {
        const next = Math.max(0, qty);
        set((s) => {
            const quantities = { ...s.quantities };
            if (next === 0) {
                delete quantities[productId];
            } else {
                quantities[productId] = next;
            }
            return { quantities };
        });
    },

    incrementQuantity: (productId) => {
        const current = get().quantities[productId] ?? 0;
        get().setQuantity(productId, current + 1);
    },

    decrementQuantity: (productId) => {
        const current = get().quantities[productId] ?? 0;
        get().setQuantity(productId, current - 1);
    },

    clearCart: () => set({ quantities: {} }),
}));
