import { ChevronRight, type LucideIcon } from 'lucide-react';

interface SettingsListItemProps {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
}

export function SettingsListItem({ label, icon: Icon, onClick }: SettingsListItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left hover:bg-surface-container"
        >
            <Icon className="h-5 w-5 shrink-0 text-on-surface-variant" />
            <span className="flex-1 text-base text-on-surface">{label}</span>
            <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant" />
        </button>
    );
}
