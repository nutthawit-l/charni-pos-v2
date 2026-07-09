import type { PagesFunction } from "@cloudflare/workers-types";
import type { ApiContextData, ApiEnv } from "../_middleware";

interface UserRow {
    id: number;
    displayName: string;
    avatarUrl: string | null;
}

export const onRequestGet: PagesFunction<ApiEnv, never, ApiContextData> = async (context) => {
    try {
        const user = await context.env.DB.prepare(
            "SELECT id, display_name AS displayName, avatar_url AS avatarUrl FROM shop_user WHERE id = ?",
        )
            .bind(context.data.userId)
            .first<UserRow>();

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify(user), {
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
