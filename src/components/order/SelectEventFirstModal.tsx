interface SelectEventFirstModalProps {
    onDismiss: () => void;
}

export function SelectEventFirstModal({ onDismiss }: SelectEventFirstModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 px-4"
            onClick={onDismiss}
            role="presentation"
        >
            <div
                className="rounded-[28px] bg-surface px-6 py-8 text-center shadow-lg"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="select-event-title"
            >
                <p id="select-event-title" className="text-base text-on-surface">
                    You must select an event first
                </p>
            </div>
        </div>
    );
}
