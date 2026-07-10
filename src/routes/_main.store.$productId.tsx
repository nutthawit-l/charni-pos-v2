import { useMemo, useState } from 'react';
import { useNavigate, useRevalidator } from 'react-router';
import type { Route } from './+types/_main.store.$productId';
import { CreateCategoryModal } from '../components/store/CreateCategoryModal';
import { DeleteProductModal } from '../components/store/DeleteProductModal';
import { OutlinedTextField } from '../components/store/OutlinedTextField';
import { ProductDetailActionBar } from '../components/store/ProductDetailActionBar';
import { ProductDetailCategoryChips } from '../components/store/ProductDetailCategoryChips';
import { ProductDetailHeader } from '../components/store/ProductDetailHeader';
import { ProductImagePicker } from '../components/store/ProductImagePicker';
import type { CategorySummary, ProductDetailResponse } from '../types/product';
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '../types/product';

export const handle = { hideBottomNav: true };

interface ProductDraft {
    name: string;
    categoryId: number | null;
    stock: string;
    imageUrl: string;
    prices: Record<CurrencyCode, string>;
}

function productToDraft(product: ProductDetailResponse): ProductDraft {
    return {
        name: product.name,
        categoryId: product.categoryId,
        stock: String(product.stock),
        imageUrl: product.imageUrl,
        prices: Object.fromEntries(
            SUPPORTED_CURRENCIES.map((c) => [c, priceToFormValue(product.prices[c])]),
        ) as Record<CurrencyCode, string>,
    };
}

function priceToFormValue(price: number | null): string {
    return price === null ? '' : String(price);
}

function parseFormPrice(value: string): number | null {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
}

function pricesEqual(
    a: Record<CurrencyCode, string>,
    b: Record<CurrencyCode, number | null>,
): boolean {
    return SUPPORTED_CURRENCIES.every(
        (c) => parseFormPrice(a[c]) === b[c],
    );
}

function hasDraftChanges(original: ProductDetailResponse, draft: ProductDraft): boolean {
    return (
        draft.name !== original.name ||
        draft.categoryId !== original.categoryId ||
        parseFormPrice(draft.stock) !== original.stock ||
        draft.imageUrl !== original.imageUrl ||
        !pricesEqual(draft.prices, original.prices)
    );
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const res = await fetch(`/api/products/${params.productId}`, { credentials: 'include' });

    if (!res.ok) {
        throw new Response('Failed to load product', { status: res.status });
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
        throw new Response(
            'Product API unavailable. Restart Wrangler (pnpm dev:wrangler) to load new API routes.',
            { status: 502 },
        );
    }

    return (await res.json()) as ProductDetailResponse;
}

clientLoader.hydrate = true as const;

export default function ProductDetailPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { revalidate } = useRevalidator();

    const [original, setOriginal] = useState<ProductDetailResponse | null>(loaderData ?? null);
    const [draft, setDraft] = useState<ProductDraft | null>(
        loaderData ? productToDraft(loaderData) : null,
    );
    const [extraCategories, setExtraCategories] = useState<CategorySummary[]>([]);
    const [prevLoaderData, setPrevLoaderData] = useState(loaderData);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [createCategoryError, setCreateCategoryError] = useState<string | null>(null);

    if (loaderData !== prevLoaderData) {
        setPrevLoaderData(loaderData);
        setOriginal(loaderData ?? null);
        setDraft(loaderData ? productToDraft(loaderData) : null);
        setExtraCategories([]);
    }

    const categories = useMemo(() => {
        const base = loaderData?.categories ?? [];
        const merged = [...base];
        for (const extra of extraCategories) {
            if (!merged.some((category) => category.id === extra.id)) {
                merged.push(extra);
            }
        }
        return merged.sort((a, b) => a.name.localeCompare(b.name));
    }, [loaderData, extraCategories]);

    const hasChanges = useMemo(() => {
        if (!original || !draft) return false;
        return hasDraftChanges(original, draft);
    }, [original, draft]);

    function updateDraft(partial: Partial<ProductDraft>) {
        setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
    }

    function handleCancel() {
        navigate('/store');
    }

    async function handleSave() {
        if (!original || !draft || !hasChanges || isSaving) return;

        const stock = parseFormPrice(draft.stock);
        if (stock === null || !Number.isInteger(stock) || stock < 0) {
            setSaveError('Stock must be a non-negative whole number');
            return;
        }

        if (draft.name.trim() === '') {
            setSaveError('Product name is required');
            return;
        }

        const prices: Partial<Record<CurrencyCode, number>> = {};
        for (const currency of SUPPORTED_CURRENCIES) {
            const price = parseFormPrice(draft.prices[currency]);
            if (price !== null) {
                if (price < 0) {
                    setSaveError(`${currency} price must be non-negative`);
                    return;
                }
                prices[currency] = price;
            }
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            const res = await fetch(`/api/products/${original.id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: draft.name.trim(),
                    categoryId: draft.categoryId,
                    stock,
                    imageUrl: draft.imageUrl,
                    prices,
                }),
            });

            if (!res.ok) {
                const data = (await res.json()) as { error?: string };
                throw new Error(data.error ?? 'Save failed');
            }

            revalidate();
            navigate('/store');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Save failed';
            setSaveError(message);
        } finally {
            setIsSaving(false);
        }
    }

    function handleDeleteClick() {
        setDeleteError(null);
        setIsDeleteModalOpen(true);
    }

    async function handleDeleteConfirm() {
        if (!original || isDeleting) return;

        setIsDeleting(true);
        setDeleteError(null);

        try {
            const res = await fetch(`/api/products/${original.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) {
                const data = (await res.json()) as { error?: string };
                throw new Error(data.error ?? 'Delete failed');
            }

            navigate('/store');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Delete failed';
            setDeleteError(message);
        } finally {
            setIsDeleting(false);
        }
    }

    function handleCreateCategoryOpen() {
        setNewCategoryName('');
        setCreateCategoryError(null);
        setIsCreateCategoryModalOpen(true);
    }

    async function handleCreateCategoryConfirm() {
        const name = newCategoryName.trim();
        if (!name || isCreatingCategory) return;

        setIsCreatingCategory(true);
        setCreateCategoryError(null);

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) {
                const data = (await res.json()) as { error?: string };
                throw new Error(data.error ?? 'Create failed');
            }

            const category = (await res.json()) as CategorySummary;
            setExtraCategories((prev) => [...prev, category]);
            updateDraft({ categoryId: category.id });
            setIsCreateCategoryModalOpen(false);
            setNewCategoryName('');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Create failed';
            setCreateCategoryError(message);
        } finally {
            setIsCreatingCategory(false);
        }
    }

    if (!loaderData || !draft) {
        return (
            <div className="flex h-full min-h-0 flex-col">
                <ProductDetailHeader onBack={handleCancel} onDelete={() => {}} />
                <p className="px-4 py-8 text-center text-sm text-on-surface-variant">
                    Loading product…
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <ProductDetailHeader onBack={handleCancel} onDelete={handleDeleteClick} />

            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
                <ProductImagePicker
                    imageUrl={draft.imageUrl}
                    onImageUrlChange={(imageUrl) => updateDraft({ imageUrl })}
                    disabled={isSaving}
                />

                <ProductDetailCategoryChips
                    categories={categories}
                    selectedCategoryId={draft.categoryId}
                    onSelect={(categoryId) => updateDraft({ categoryId })}
                    onCreateCategory={handleCreateCategoryOpen}
                />

                <div className="flex flex-col gap-4 px-4 py-2">
                    <OutlinedTextField
                        label="Product name"
                        value={draft.name}
                        onChange={(name) => updateDraft({ name })}
                        disabled={isSaving}
                    />
                    <OutlinedTextField
                        label="Stock quantities"
                        type="number"
                        value={draft.stock}
                        onChange={(stock) => updateDraft({ stock })}
                        disabled={isSaving}
                    />
                </div>

                <div className="px-4 py-2">
                    <p className="mb-3 text-sm font-medium text-on-surface-variant">Pricing</p>
                    <div className="flex flex-col gap-4">
                        {SUPPORTED_CURRENCIES.map((currency) => (
                            <OutlinedTextField
                                key={currency}
                                label={currency}
                                type="number"
                                value={draft.prices[currency]}
                                onChange={(value) =>
                                    updateDraft({
                                        prices: { ...draft.prices, [currency]: value },
                                    })
                                }
                                disabled={isSaving}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {saveError && (
                <p className="shrink-0 px-4 py-2 text-center text-sm text-red-600">{saveError}</p>
            )}

            <ProductDetailActionBar
                hasChanges={hasChanges}
                isSaving={isSaving}
                onCancel={handleCancel}
                onSave={handleSave}
            />

            <DeleteProductModal
                open={isDeleteModalOpen}
                isDeleting={isDeleting}
                error={deleteError}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    if (!isDeleting) {
                        setIsDeleteModalOpen(false);
                        setDeleteError(null);
                    }
                }}
            />

            <CreateCategoryModal
                open={isCreateCategoryModalOpen}
                name={newCategoryName}
                isCreating={isCreatingCategory}
                error={createCategoryError}
                onNameChange={setNewCategoryName}
                onConfirm={handleCreateCategoryConfirm}
                onCancel={() => {
                    if (!isCreatingCategory) {
                        setIsCreateCategoryModalOpen(false);
                        setCreateCategoryError(null);
                    }
                }}
            />
        </div>
    );
}
