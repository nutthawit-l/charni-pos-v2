import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface CenteredModalProps {
    open?: boolean;
    onBackdropClick?: () => void;
    ariaLabelledBy?: string;
    role?: 'dialog' | 'alertdialog';
    panelClassName?: string;
    backdropDisabled?: boolean;
    children: ReactNode;
}

export function CenteredModal({
    open = true,
    onBackdropClick,
    ariaLabelledBy,
    role = 'dialog',
    panelClassName,
    backdropDisabled = false,
    children,
}: CenteredModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 px-4"
            onClick={backdropDisabled ? undefined : onBackdropClick}
            role="presentation"
        >
            <div
                className={cn(
                    'w-full max-w-[400px] rounded-[28px] bg-surface shadow-lg',
                    panelClassName,
                )}
                onClick={(e) => e.stopPropagation()}
                role={role}
                aria-modal="true"
                aria-labelledby={ariaLabelledBy}
            >
                {children}
            </div>
        </div>
    );
}
