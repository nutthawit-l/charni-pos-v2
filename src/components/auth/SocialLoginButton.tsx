import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SocialLoginButtonProps {
    label: string;
    icon: LucideIcon;
    className?: string;
}

export function SocialLoginButton({ label, icon: Icon, className }: SocialLoginButtonProps) {
    return (
        <button
            type="button"
            className={cn(
                'flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface',
                className,
            )}
        >
            <Icon className="h-4 w-4 text-on-surface-variant" />
            <span className="text-sm font-medium text-on-surface-variant">{label}</span>
        </button>
    );
}
