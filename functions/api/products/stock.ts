import type { PagesFunction } from "@cloudflare/workers-types";
import type { ApiContextData, ApiEnv } from "../_middleware";

interface ShopMemberRow {
    shop_id: number;
}

interface StockUpdateItem {
    productId: number;
    stock: number;
}

interface StockUpdateRequestBody {
    items: StockUpdateItem[];
}

interface ProductOwnershipRow {
    id: number;
}

function isValidStockItem(item: unknown): item is StockUpdateItem {
    if (typeof item !== "object" || item === null) return false;
    const { productId, stock } = item as StockUpdateItem;
    return Number.isInteger(productId) && productId > 0
        && Number.isInteger(stock) && stock >= 0;
}

export const onRequestPatch: PagesFunction<ApiEnv, never, ApiContextData> = async (context) => {
    try {
        const body = (await context.request.json()) as StockUpdateRequestBody;

        if (!Array.isArray(body.items) || body.items.length === 0) {
            return new Response(JSON.stringify({ error: "Invalid stock update payload" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (!body.items.every(isValidStockItem)) {
            return new Response(JSON.stringify({ error: "Invalid stock update items" }), {
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
            return new Response(JSON.stringify({ error: "Shop not found" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        for (const item of body.items) {
            const product = await context.env.DB.prepare(
                "SELECT id FROM product WHERE id = ? AND shop_id = ?",
            )
                .bind(item.productId, member.shop_id)
                .first<ProductOwnershipRow>();

            if (!product) {
                return new Response(JSON.stringify({ error: `Product ${item.productId} not found` }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }

        const statements = body.items.map((item) =>
            context.env.DB.prepare(
                "UPDATE product SET stock = ? WHERE id = ? AND shop_id = ?",
            ).bind(item.stock, item.productId, member.shop_id),
        );

        await context.env.DB.batch(statements);

        return new Response(
            JSON.stringify({ updated: body.items.length }),
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
