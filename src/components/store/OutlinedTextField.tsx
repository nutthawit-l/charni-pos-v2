import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OutlinedTextFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'number' | 'tel';
    placeholder?: string;
    alwaysFloatLabel?: boolean;
    disabled?: boolean;
    className?: string;
}

export function OutlinedTextField({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    alwaysFloatLabel = false,
    disabled = false,
    className,
}: OutlinedTextFieldProps) {
    const [focused, setFocused] = useState(false);
    const hasValue = value.length > 0;
    const floated = alwaysFloatLabel || hasValue || focused;

    return (
        <div className={cn('relative', className)}>
            <div
                className={cn(
                    'relative flex min-h-14 items-center rounded-lg border-2 px-4',
                    disabled
                        ? 'border-outline-variant/60'
                        : 'border-primary focus-within:border-primary',
                )}
            >
                <label
                    className={cn(
                        'pointer-events-none absolute left-3 bg-surface px-1 transition-all duration-150',
                        floated
                            ? '-top-2.5 text-xs'
                            : 'top-1/2 -translate-y-1/2 text-base',
                        disabled
                            ? 'text-on-surface-variant'
                            : floated
                              ? 'text-primary'
                              : 'text-on-surface-variant',
                    )}
                >
                    {label}
                </label>
                <input
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    disabled={disabled}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        'min-w-0 flex-1 bg-transparent text-base text-on-surface outline-none disabled:text-on-surface-variant',
                        floated ? 'pt-4 pb-2' : 'py-4',
                    )}
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
