import { useMemo, useState } from 'react';
import { useNavigate, useRevalidator } from 'react-router';
import type { Route } from './+types/_main.store.new';
import { CreateCategoryModal } from '../components/store/CreateCategoryModal';
import { NewProductHeader } from '../components/store/NewProductHeader';
import { OutlinedTextField } from '../components/store/OutlinedTextField';
import { ProductDetailActionBar } from '../components/store/ProductDetailActionBar';
import { ProductDetailCategoryChips } from '../components/store/ProductDetailCategoryChips';
import { ProductImagePicker } from '../components/store/ProductImagePicker';
import type { CategorySummary, ProductsResponse } from '../types/product';
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '../types/product';

export const handle = { hideBottomNav: true };

interface ProductDraft {
    name: string;
    categoryId: number | null;
    stock: string;
    imageUrl: string;
    prices: Record<CurrencyCode, string>;
}

function emptyDraft(): ProductDraft {
    return {
        name: '',
        categoryId: null,
        stock: '',
        imageUrl: '',
        prices: Object.fromEntries(SUPPORTED_CURRENCIES.map((c) => [c, ''])) as Record<
            CurrencyCode,
            string
        >,
    };
}

function parseFormPrice(value: string): number | null {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
}

function isDraftSavable(draft: ProductDraft): boolean {
    if (draft.name.trim() === '') return false;
    if (draft.imageUrl.trim() === '') return false;

    const stock = parseFormPrice(draft.stock);
    if (stock === null || !Number.isInteger(stock) || stock < 0) return false;

    for (const currency of SUPPORTED_CURRENCIES) {
        const price = parseFormPrice(draft.prices[currency]);
        if (price !== null && price < 0) return false;
    }

    return true;
}

export async function clientLoader() {
    const res = await fetch('/api/products?currency=SGD', { credentials: 'include' });

    if (!res.ok) {
        throw new Response('Failed to load categories', { status: res.status });
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
        throw new Response(
            'Products API unavailable. Restart Wrangler (pnpm dev:wrangler) to load new API routes.',
            { status: 502 },
        );
    }

    const data = (await res.json()) as ProductsResponse;
    return { categories: data.categories };
}

clientLoader.hydrate = true as const;

export default function NewProductPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
    const { revalidate } = useRevalidator();

    const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
    const [extraCategories, setExtraCategories] = useState<CategorySummary[]>([]);
    const [prevLoaderData, setPrevLoaderData] = useState(loaderData);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [createCategoryError, setCreateCategoryError] = useState<string | null>(null);

    if (loaderData !== prevLoaderData) {
        setPrevLoaderData(loaderData);
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

    const canSave = useMemo(() => isDraftSavable(draft), [draft]);

    function updateDraft(partial: Partial<ProductDraft>) {
        setDraft((prev) => ({ ...prev, ...partial }));
    }

    function handleCancel() {
        navigate('/store');
    }

    async function handleSave() {
        if (!canSave || isSaving) return;

        const stock = parseFormPrice(draft.stock);
        if (stock === null || !Number.isInteger(stock) || stock < 0) {
            setSaveError('Stock must be a non-negative whole number');
            return;
        }

        if (draft.name.trim() === '') {
            setSaveError('Product name is required');
            return;
        }

        if (draft.imageUrl.trim() === '') {
            setSaveError('Product image is required');
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
            const res = await fetch('/api/products', {
                method: 'POST',
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

    return (
        <div className="flex h-full min-h-0 flex-col">
            <NewProductHeader onBack={handleCancel} />

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
                hasChanges={canSave}
                isSaving={isSaving}
                onCancel={handleCancel}
                onSave={handleSave}
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
