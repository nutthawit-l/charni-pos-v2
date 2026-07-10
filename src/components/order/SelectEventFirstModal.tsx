import { CenteredModal } from '../CenteredModal';

interface SelectEventFirstModalProps {
    onDismiss: () => void;
}

export function SelectEventFirstModal({ onDismiss }: SelectEventFirstModalProps) {
    return (
        <CenteredModal
            onBackdropClick={onDismiss}
            role="alertdialog"
            ariaLabelledBy="select-event-title"
            panelClassName="px-6 py-8 text-center"
        >
            <p id="select-event-title" className="text-base text-on-surface">
                You must select an event first
            </p>
        </CenteredModal>
    );
}
