import type { PagesFunction } from "@cloudflare/workers-types";
import type { ApiContextData, ApiEnv } from "./_middleware";

const SUPPORTED_CURRENCIES = ["THB", "SGD", "USD", "JPY"] as const;
type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

interface ShopMemberRow {
    shop_id: number;
}

interface ShopRow {
    name: string;
}

interface CategoryRow {
    id: number;
    name: string;
}

interface ProductRow {
    id: number;
    name: string;
    categoryId: number | null;
    categoryName: string | null;
    imageUrl: string;
    stock: number;
    price: number;
}

interface ProductCreateBody {
    name: string;
    categoryId: number | null;
    stock: number;
    imageUrl: string;
    prices: Partial<Record<CurrencyCode, number>>;
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function isValidCreateBody(body: unknown): body is ProductCreateBody {
    if (typeof body !== "object" || body === null) return false;
    const { name, categoryId, stock, imageUrl, prices } = body as ProductCreateBody;
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

export const onRequestPost: PagesFunction<ApiEnv, never, ApiContextData> = async (context) => {
    try {
        const body = (await context.request.json()) as unknown;
        if (!isValidCreateBody(body)) {
            return jsonResponse({ error: "Invalid product create payload" }, 400);
        }

        const shopId = await getShopId(context);
        if (!shopId) {
            return jsonResponse({ error: "Shop not found" }, 403);
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

        const result = await context.env.DB.prepare(
            `INSERT INTO product (shop_id, category_id, name, image_url, stock)
             VALUES (?, ?, ?, ?, ?)`,
        )
            .bind(shopId, body.categoryId, body.name.trim(), body.imageUrl, body.stock)
            .run();

        const productId = result.meta.last_row_id;
        if (!productId) {
            return jsonResponse({ error: "Failed to create product" }, 500);
        }

        const statements = [];
        for (const currency of SUPPORTED_CURRENCIES) {
            const price = body.prices[currency];
            if (price !== undefined) {
                statements.push(
                    context.env.DB.prepare(
                        `INSERT INTO product_price (product_id, currency_code, price)
                         VALUES (?, ?, ?)`,
                    ).bind(productId, currency, price),
                );
            }
        }

        if (statements.length > 0) {
            await context.env.DB.batch(statements);
        }

        return jsonResponse({ id: productId }, 201);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return jsonResponse({ error: message }, 500);
    }
};

export const onRequestGet: PagesFunction<ApiEnv, never, ApiContextData> = async (context) => {
    try {
        const url = new URL(context.request.url);
        const currencyParam = url.searchParams.get("currency");
        const currencyCode = (currencyParam ?? "SGD").toUpperCase();

        if (!/^[A-Z]{3}$/.test(currencyCode)) {
            return new Response(JSON.stringify({ error: "Invalid currency code" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const member = await context.env.DB.prepare(
            "SELECT shop_id FROM shop_member WHERE user_id = ?",
        )
            .bind(context.data.userId)
            .first<ShopMemberRow>();

        if (!member) {
            return new Response(
                JSON.stringify({ shopName: "", currencyCode, categories: [], products: [] }),
                { headers: { "Content-Type": "application/json" } },
            );
        }

        const shop = await context.env.DB.prepare(
            "SELECT name FROM shop WHERE id = ?",
        )
            .bind(member.shop_id)
            .first<ShopRow>();

        const { results: categories } = await context.env.DB.prepare(
            "SELECT id, name FROM category WHERE shop_id = ? ORDER BY name",
        )
            .bind(member.shop_id)
            .all<CategoryRow>();

        const { results: products } = await context.env.DB.prepare(
            `SELECT p.id, p.name, p.category_id AS categoryId, p.image_url AS imageUrl,
                    p.stock, c.name AS categoryName, pp.price
             FROM product p
             LEFT JOIN category c ON p.category_id = c.id
             JOIN product_price pp ON pp.product_id = p.id AND pp.currency_code = ?
             WHERE p.shop_id = ?
             ORDER BY c.name, p.name`,
        )
            .bind(currencyCode, member.shop_id)
            .all<ProductRow>();

        return new Response(
            JSON.stringify({
                shopName: shop?.name ?? "",
                currencyCode,
                categories: categories ?? [],
                products: products ?? [],
            }),
            { headers: { "Content-Type": "application/json" } },
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
