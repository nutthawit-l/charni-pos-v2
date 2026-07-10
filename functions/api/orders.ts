import type { PagesFunction } from "@cloudflare/workers-types";
import type { ApiContextData, ApiEnv } from "./_middleware";

interface OrderItemInput {
    productId: number;
    quantity: number;
}

interface OrderRequestBody {
    eventId: number;
    items: OrderItemInput[];
}

interface ShopMemberRow {
    shop_id: number;
}

interface EventRow {
    id: number;
    shop_id: number;
    country: string;
}

interface ProductRow {
    id: number;
    stock: number;
    price: number;
}

interface OrderRow {
    id: number;
    totalIncome: number;
    totalProductSold: number;
    createdAt: string;
}

interface SoldProductRow {
    productId: number;
    productName: string;
    imageUrl: string;
    categoryName: string | null;
    price: number;
    totalSold: number;
}

function currencyForCountry(country: string): string {
    return country === "Singapore" ? "SGD" : "THB";
}

export const onRequestGet: PagesFunction<ApiEnv, never, ApiContextData> = async (context) => {
    try {
        const url = new URL(context.request.url);
        const eventIdParam = url.searchParams.get("eventId");
        if (!eventIdParam) {
            return new Response(JSON.stringify({ error: "eventId is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const eventId = Number(eventIdParam);
        if (!Number.isInteger(eventId) || eventId <= 0) {
            return new Response(JSON.stringify({ error: "Invalid eventId" }), {
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

        const event = await context.env.DB.prepare(
            "SELECT id, shop_id, country FROM event WHERE id = ?",
        )
            .bind(eventId)
            .first<EventRow>();

        if (!event || event.shop_id !== member.shop_id) {
            return new Response(JSON.stringify({ error: "Event not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        const currencyCode = currencyForCountry(event.country);

        const { results: orders } = await context.env.DB.prepare(
            `SELECT id, total_income AS totalIncome, total_product_sold AS totalProductSold,
                    created_at AS createdAt
             FROM shop_order
             WHERE event_id = ?
             ORDER BY created_at DESC`,
        )
            .bind(eventId)
            .all<OrderRow>();

        const { results: products } = await context.env.DB.prepare(
            `SELECT p.id AS productId, p.name AS productName, p.image_url AS imageUrl,
                    c.name AS categoryName, pp.price, SUM(oi.quantity) AS totalSold
             FROM order_item oi
             JOIN shop_order o ON oi.order_id = o.id
             JOIN product p ON oi.product_id = p.id
             LEFT JOIN category c ON p.category_id = c.id
             JOIN product_price pp ON pp.product_id = p.id AND pp.currency_code = ?
             WHERE o.event_id = ?
             GROUP BY p.id
             ORDER BY totalSold DESC`,
        )
            .bind(currencyCode, eventId)
            .all<SoldProductRow>();

        return new Response(
            JSON.stringify({
                currencyCode,
                orders: orders ?? [],
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

export const onRequestPost: PagesFunction<ApiEnv, never, ApiContextData> = async (context) => {
    try {
        const body = (await context.request.json()) as OrderRequestBody;

        if (!body.eventId || !Array.isArray(body.items) || body.items.length === 0) {
            return new Response(JSON.stringify({ error: "Invalid order payload" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const validItems = body.items.filter((item) => item.quantity > 0);
        if (validItems.length === 0) {
            return new Response(JSON.stringify({ error: "No items in order" }), {
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

        const event = await context.env.DB.prepare(
            "SELECT id, shop_id, country FROM event WHERE id = ?",
        )
            .bind(body.eventId)
            .first<EventRow>();

        if (!event || event.shop_id !== member.shop_id) {
            return new Response(JSON.stringify({ error: "Event not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        const currencyCode = currencyForCountry(event.country);
        let totalIncome = 0;
        let totalProductSold = 0;
        const lineItems: { productId: number; quantity: number; price: number }[] = [];

        for (const item of validItems) {
            const product = await context.env.DB.prepare(
                `SELECT p.id, p.stock, pp.price
                 FROM product p
                 JOIN product_price pp ON pp.product_id = p.id AND pp.currency_code = ?
                 WHERE p.id = ? AND p.shop_id = ?`,
            )
                .bind(currencyCode, item.productId, member.shop_id)
                .first<ProductRow>();

            if (!product) {
                return new Response(JSON.stringify({ error: `Product ${item.productId} not found` }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            if (product.stock < item.quantity) {
                return new Response(JSON.stringify({ error: `Insufficient stock for product ${item.productId}` }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            totalIncome += product.price * item.quantity;
            totalProductSold += item.quantity;
            lineItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
        }

        const orderResult = await context.env.DB.prepare(
            `INSERT INTO shop_order (currency_code, total_income, total_product_sold, event_id)
             VALUES (?, ?, ?, ?)`,
        )
            .bind(currencyCode, totalIncome, totalProductSold, body.eventId)
            .run();

        const orderId = orderResult.meta.last_row_id;
        if (!orderId) {
            return new Response(JSON.stringify({ error: "Failed to create order" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        const statements = lineItems.flatMap((line) => [
            context.env.DB.prepare(
                "INSERT INTO order_item (order_id, product_id, quantity, price_per_unit) VALUES (?, ?, ?, ?)",
            ).bind(orderId, line.productId, line.quantity, line.price),
            context.env.DB.prepare(
                "UPDATE product SET stock = stock - ? WHERE id = ?",
            ).bind(line.quantity, line.productId),
        ]);

        await context.env.DB.batch(statements);

        return new Response(
            JSON.stringify({ orderId, totalIncome, totalProductSold }),
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
