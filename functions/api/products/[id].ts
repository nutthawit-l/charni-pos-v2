import type { PagesFunction } from "@cloudflare/workers-types";
import type { ApiContextData, ApiEnv } from "../_middleware";

const SUPPORTED_CURRENCIES = ["THB", "SGD", "USD", "JPY"] as const;
type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

interface ShopMemberRow {
    shop_id: number;
}

interface ProductRow {
    id: number;
    name: string;
    categoryId: number | null;
    imageUrl: string;
    stock: number;
}

interface PriceRow {
    currency_code: string;
    price: number;
}

interface CategoryRow {
    id: number;
    name: string;
}

interface ProductUpdateBody {
    name: string;
    categoryId: number | null;
    stock: number;
    imageUrl: string;
    prices: Partial<Record<CurrencyCode, number>>;
}

function parseProductId(params: Record<string, string | string[] | undefined>): number | null {
    const raw = params.id;
    if (!raw || typeof raw !== "string") return null;
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) return null;
    return id;
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function buildPricesRecord(rows: PriceRow[]): Record<CurrencyCode, number | null> {
    const byCurrency = new Map(rows.map((r) => [r.currency_code, r.price]));
    return {
        THB: byCurrency.get("THB") ?? null,
        SGD: byCurrency.get("SGD") ?? null,
        USD: byCurrency.get("USD") ?? null,
        JPY: byCurrency.get("JPY") ?? null,
    };
}

function isValidUpdateBody(body: unknown): body is ProductUpdateBody {
    if (typeof body !== "object" || body === null) return false;
    const { name, categoryId, stock, imageUrl, prices } = body as ProductUpdateBody;
    if (typeof name !== "string" || name.trim() === "") return false;
    if (categoryId !== null && (!Number.isInteger(categoryId) || categoryId <= 0)) return false;
    if (!Number.isInteger(stock) || stock < 0) return false;
    if (typeof imageUrl !== "string" || imageUrl === "") return false;
    if (typeof prices !== "object" || prices === null) return false;
    for (const currency of SUPPORTED_CURRENCIES) {
        const value = prices[currency];
        if (value !== undefined && (typeof value !== "number" || value < 0 || !Number.isFinite(value))) {
            return false;
        }
    }
    return true;
}

async function getShopId(context: { env: ApiEnv; data: ApiContextData }): Promise<number | null> {
    const member = await context.env.DB.prepare(
        "SELECT shop_id FROM shop_member WHERE user_id = ?",
    )
        .bind(context.data.userId)
        .first<ShopMemberRow>();
    return member?.shop_id ?? null;
}

export const onRequestGet: PagesFunction<ApiEnv, "id", ApiContextData> = async (context) => {
    try {
        const productId = parseProductId(context.params);
        if (!productId) {
            return jsonResponse({ error: "Invalid product id" }, 400);
        }

        const shopId = await getShopId(context);
        if (!shopId) {
            return jsonResponse({ error: "Shop not found" }, 403);
        }

        const product = await context.env.DB.prepare(
            `SELECT id, name, category_id AS categoryId, image_url AS imageUrl, stock
             FROM product
             WHERE id = ? AND shop_id = ?`,
        )
            .bind(productId, shopId)
            .first<ProductRow>();

        if (!product) {
            return jsonResponse({ error: "Product not found" }, 404);
        }

        const { results: priceRows } = await context.env.DB.prepare(
            "SELECT currency_code, price FROM product_price WHERE product_id = ?",
        )
            .bind(productId)
            .all<PriceRow>();

        const { results: categories } = await context.env.DB.prepare(
            "SELECT id, name FROM category WHERE shop_id = ? ORDER BY name",
        )
            .bind(shopId)
            .all<CategoryRow>();

        return jsonResponse({
            ...product,
            prices: buildPricesRecord(priceRows ?? []),
            categories: categories ?? [],
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: message }, 500);
    }
};

export const onRequestPatch: PagesFunction<ApiEnv, "id", ApiContextData> = async (context) => {
    try {
        const productId = parseProductId(context.params);
        if (!productId) {
            return jsonResponse({ error: "Invalid product id" }, 400);
        }

        const body = (await context.request.json()) as unknown;
        if (!isValidUpdateBody(body)) {
            return jsonResponse({ error: "Invalid product update payload" }, 400);
        }

        const shopId = await getShopId(context);
        if (!shopId) {
            return jsonResponse({ error: "Shop not found" }, 403);
        }

        const existing = await context.env.DB.prepare(
            "SELECT id FROM product WHERE id = ? AND shop_id = ?",
        )
            .bind(productId, shopId)
            .first<{ id: number }>();

        if (!existing) {
            return jsonResponse({ error: "Product not found" }, 404);
        }

        if (body.categoryId !== null) {
            const category = await context.env.DB.prepare(
                "SELECT id FROM category WHERE id = ? AND shop_id = ?",
            )
                .bind(body.categoryId, shopId)
                .first<{ id: number }>();

            if (!category) {
                return jsonResponse({ error: "Category not found" }, 400);
            }
        }

        const statements = [
            context.env.DB.prepare(
                `UPDATE product
                 SET name = ?, category_id = ?, stock = ?, image_url = ?
                 WHERE id = ? AND shop_id = ?`,
            ).bind(
                body.name.trim(),
                body.categoryId,
                body.stock,
                body.imageUrl,
                productId,
                shopId,
            ),
        ];

        for (const currency of SUPPORTED_CURRENCIES) {
            const price = body.prices[currency];
            if (price !== undefined) {
                statements.push(
                    context.env.DB.prepare(
                        `INSERT INTO product_price (product_id, currency_code, price)
                         VALUES (?, ?, ?)
                         ON CONFLICT (product_id, currency_code)
                         DO UPDATE SET price = excluded.price`,
                    ).bind(productId, currency, price),
                );
            }
        }

        await context.env.DB.batch(statements);

        return jsonResponse({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: message }, 500);
    }
};

export const onRequestDelete: PagesFunction<ApiEnv, "id", ApiContextData> = async (context) => {
    try {
        const productId = parseProductId(context.params);
        if (!productId) {
            return jsonResponse({ error: "Invalid product id" }, 400);
        }

        const shopId = await getShopId(context);
        if (!shopId) {
            return jsonResponse({ error: "Shop not found" }, 403);
        }

        const existing = await context.env.DB.prepare(
            "SELECT id FROM product WHERE id = ? AND shop_id = ?",
        )
            .bind(productId, shopId)
            .first<{ id: number }>();

        if (!existing) {
            return jsonResponse({ error: "Product not found" }, 404);
        }

        const sold = await context.env.DB.prepare(
            "SELECT COUNT(*) AS count FROM order_item WHERE product_id = ?",
        )
            .bind(productId)
            .first<{ count: number }>();

        if (sold && sold.count > 0) {
            return jsonResponse(
                { error: "Cannot delete a product that has been sold" },
                409,
            );
        }

        await context.env.DB.prepare(
            "DELETE FROM product WHERE id = ? AND shop_id = ?",
        )
            .bind(productId, shopId)
            .run();

        return jsonResponse({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: message }, 500);
    }
};
