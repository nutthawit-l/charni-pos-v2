import type { PagesFunction } from "@cloudflare/workers-types";
import type { ApiContextData, ApiEnv } from "./_middleware";

interface ShopMemberRow {
    shop_id: number;
}

interface CategoryRow {
    id: number;
    name: string;
}

interface CreateCategoryBody {
    name: string;
}

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export const onRequestPost: PagesFunction<ApiEnv, never, ApiContextData> = async (context) => {
    try {
        const body = (await context.request.json()) as CreateCategoryBody;
        const name = typeof body.name === "string" ? body.name.trim() : "";

        if (!name) {
            return jsonResponse({ error: "Category name is required" }, 400);
        }

        const member = await context.env.DB.prepare(
            "SELECT shop_id FROM shop_member WHERE user_id = ?",
        )
            .bind(context.data.userId)
            .first<ShopMemberRow>();

        if (!member) {
            return jsonResponse({ error: "Shop not found" }, 403);
        }

        const existing = await context.env.DB.prepare(
            "SELECT id FROM category WHERE shop_id = ? AND name = ?",
        )
            .bind(member.shop_id, name)
            .first<{ id: number }>();

        if (existing) {
            return jsonResponse({ error: "Category already exists" }, 409);
        }

        const result = await context.env.DB.prepare(
            "INSERT INTO category (shop_id, name) VALUES (?, ?)",
        )
            .bind(member.shop_id, name)
            .run();

        const id = result.meta.last_row_id;
        if (!id) {
            return jsonResponse({ error: "Failed to create category" }, 500);
        }

        const category: CategoryRow = { id, name };
        return jsonResponse(category, 201);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("UNIQUE constraint failed")) {
            return jsonResponse({ error: "Category already exists" }, 409);
        }
        return jsonResponse({ error: message }, 500);
    }
};
