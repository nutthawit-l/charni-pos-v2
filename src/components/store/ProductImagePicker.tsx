import { useRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface ProductImagePickerProps {
    imageUrl: string;
    onImageUrlChange: (imageUrl: string) => void;
    disabled?: boolean;
}

export function ProductImagePicker({
    imageUrl,
    onImageUrlChange,
    disabled = false,
}: ProductImagePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || disabled || isUploading) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/product-images', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!res.ok) {
                const data = (await res.json()) as { error?: string };
                throw new Error(data.error ?? 'Upload failed');
            }

            const data = (await res.json()) as { imageUrl: string };
            onImageUrlChange(data.imageUrl);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Upload failed';
            setUploadError(message);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="px-4">
            <button
                type="button"
                disabled={disabled || isUploading}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    'relative h-48 w-full overflow-hidden rounded-2xl bg-surface-container',
                    !disabled && !isUploading && 'cursor-pointer',
                    (disabled || isUploading) && 'opacity-60',
                )}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <>
                        <div className="absolute left-4 top-4 h-16 w-16 rotate-12 rounded-lg bg-outline-variant/60" />
                        <div className="absolute right-6 top-8 h-20 w-20 -rotate-6 rounded-full bg-outline-variant/40" />
                        <div className="absolute bottom-4 left-1/3 h-12 w-24 rounded-lg bg-outline-variant/50" />
                    </>
                )}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-on-surface/20">
                        <span className="text-sm font-medium text-on-surface">Uploading…</span>
                    </div>
                )}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
            />
            {uploadError && (
                <p className="mt-2 text-center text-sm text-red-600">{uploadError}</p>
            )}
        </div>
    );
}
