import { Plus } from 'lucide-react';

export function NewEventButton() {
    return (
        <div className="px-4 py-6">
            <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-on-primary"
            >
                <Plus className="h-5 w-5" />
                New Event
            </button>
        </div>
    );
}
