import type { D1Database } from "@cloudflare/workers-types";

const SESSION_COOKIE = 'session_token';

export interface SessionEnv {
    DB: D1Database;
}

export interface Session {
    userId: number;
}

export function getCookie(cookieHeader: string | null, name: string): string | null {
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
        const parts = cookie.split('=');
        const key = parts[0]?.trim();
        if (key === name) return decodeURIComponent(parts.slice(1).join('='));
    }
    return null;
}

export async function getSession(
    request: { headers: { get(name: string): string | null } },
    env: SessionEnv,
): Promise<Session | null> {
    const token = getCookie(request.headers.get('Cookie'), SESSION_COOKIE);
    if (!token) return null;
    
    const row = await env.DB.prepare(
        'SELECT user_id, expires_at FROM session WHERE id = ?',
    )
        .bind(token)
        .first<{ user_id: number, expires_at: string }>();
        
    if (!row) return null;
    
    if (new Date(row.expires_at).getTime() < Date.now()) return null;
    
    return { userId: row.user_id };
}