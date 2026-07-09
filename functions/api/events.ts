import type { PagesFunction } from "@cloudflare/workers-types";
import type { ApiContextData, ApiEnv } from "./_middleware";

interface ShopMemberRow {
    shop_id: number;
}

interface EventRow {
    id: number;
    name: string;
    country: string;
    startAt: string;
    endAt: string;
    role: "creator" | "collaborator" | "assistant" | null;
}

export const onRequestGet: PagesFunction<ApiEnv, never, ApiContextData> = async (context) => {
    try {
        const member = await context.env.DB.prepare(
            "SELECT shop_id FROM shop_member WHERE user_id = ?",
        )
            .bind(context.data.userId)
            .first<ShopMemberRow>();

        if (!member) {
            return new Response(JSON.stringify([]), {
                headers: { "Content-Type": "application/json" },
            });
        }

        const { results } = await context.env.DB.prepare(
            `SELECT e.id, e.name, e.country,
                    e.start_at AS startAt, e.end_at AS endAt,
                    em.role
             FROM event e
             LEFT JOIN event_member em ON e.id = em.event_id AND em.user_id = ?
             WHERE e.shop_id = ?
             ORDER BY e.start_at ASC`,
        )
            .bind(context.data.userId, member.shop_id)
            .all<EventRow>();

        return new Response(JSON.stringify(results ?? []), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
