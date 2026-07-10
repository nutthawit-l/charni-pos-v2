import type { PagesFunction } from "@cloudflare/workers-types";
import type { ApiContextData, ApiEnv } from "../_middleware";
import { buildClearSessionCookie, destroySession, getCookie, SESSION_COOKIE } from "../../lib/session";

export const onRequestPost: PagesFunction<ApiEnv, never, ApiContextData> = async (context) => {
    const token = getCookie(context.request.headers.get("Cookie"), SESSION_COOKIE);
    if (token) {
        await destroySession(context.env, token);
    }

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Set-Cookie": buildClearSessionCookie(),
        },
    });
};
