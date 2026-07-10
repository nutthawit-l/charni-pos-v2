import type { PagesFunction } from "@cloudflare/workers-types";
import type { ApiContextData, ApiEnv } from "./_middleware";

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
