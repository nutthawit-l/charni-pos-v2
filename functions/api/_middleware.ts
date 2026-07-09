import type { D1Database, PagesFunction } from "@cloudflare/workers-types";
import { getSession } from '../lib/session';

export interface ApiEnv {
    DB: D1Database;
}

export interface ApiContextData extends Record<string, unknown> {
    userId: number;
}

export const onRequest: PagesFunction<ApiEnv, never, ApiContextData> = async (context) => {
    const session = await getSession(context.request, context.env);
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' },
        });
    }
    context.data.userId = session.userId;
    return await context.next();
};
