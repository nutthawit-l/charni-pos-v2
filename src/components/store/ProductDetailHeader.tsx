import { ArrowLeft, Trash2 } from 'lucide-react';

interface ProductDetailHeaderProps {
    onBack: () => void;
    onDelete: () => void;
}

export function ProductDetailHeader({ onBack, onDelete }: ProductDetailHeaderProps) {
    return (
        <header className="flex shrink-0 items-center justify-between px-2 py-2">
            <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface"
            >
                <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="flex-1 text-xl font-normal text-on-surface">Product details</h1>
            <button
                type="button"
                onClick={onDelete}
                aria-label="Delete product"
                className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </header>
    );
}
