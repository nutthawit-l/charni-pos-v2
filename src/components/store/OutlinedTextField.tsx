import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OutlinedTextFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'number';
    disabled?: boolean;
    className?: string;
}

export function OutlinedTextField({
    label,
    value,
    onChange,
    type = 'text',
    disabled = false,
    className,
}: OutlinedTextFieldProps) {
    const hasValue = value.length > 0;

    return (
        <div className={cn('relative', className)}>
            <div
                className={cn(
                    'flex items-center rounded-lg border-2 px-4 py-3',
                    disabled
                        ? 'border-outline-variant/60'
                        : 'border-primary focus-within:border-primary',
                )}
            >
                <label
                    className={cn(
                        'pointer-events-none absolute left-3 bg-surface px-1 text-xs',
                        disabled ? 'text-on-surface-variant' : 'text-primary',
                    )}
                >
                    {label}
                </label>
                <input
                    type={type}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent pt-1 text-base text-on-surface outline-none disabled:text-on-surface-variant"
                />
                {hasValue && !disabled && (
                    <button
                        type="button"
                        aria-label={`Clear ${label}`}
                        onClick={() => onChange('')}
                        className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
