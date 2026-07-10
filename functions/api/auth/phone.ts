import type { PagesFunction } from "@cloudflare/workers-types";
import { normalizePhone } from "../../lib/phone";
import { buildSessionCookie, createSession } from "../../lib/session";
import type { ApiEnv } from "../_middleware";

interface PhoneLoginBody {
    phone?: string;
    rememberMe?: boolean;
}

interface ShopUserRow {
    id: number;
}

export const onRequestPost: PagesFunction<ApiEnv> = async (context) => {
    try {
        const body = (await context.request.json()) as PhoneLoginBody;
        const phone = normalizePhone(body.phone ?? "");
        if (!phone) {
            return new Response(JSON.stringify({ error: "Invalid phone number" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const user = await context.env.DB.prepare(
            "SELECT id FROM shop_user WHERE phone = ?",
        )
            .bind(phone)
            .first<ShopUserRow>();

        if (!user) {
            return new Response(JSON.stringify({ error: "Phone not registered" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const { token, expiresAt } = await createSession(
            context.env,
            user.id,
            body.rememberMe ?? false,
        );

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": buildSessionCookie(token, expiresAt),
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
