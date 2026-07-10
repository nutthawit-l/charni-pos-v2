import type { D1Database } from "@cloudflare/workers-types";

export const SESSION_COOKIE = 'session_token';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;

export interface SessionEnv {
    DB: D1Database;
}

export interface Session {
    userId: number;
}

export interface CreatedSession {
    token: string;
    expiresAt: string;
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

export async function createSession(
    env: SessionEnv,
    userId: number,
    rememberMe = false,
): Promise<CreatedSession> {
    const token = crypto.randomUUID();
    const expiresAt = new Date(
        Date.now() + (rememberMe ? THIRTY_DAYS_MS : ONE_DAY_MS),
    ).toISOString();

    await env.DB.prepare(
        'INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)',
    )
        .bind(token, userId, expiresAt)
        .run();

    return { token, expiresAt };
}

export function buildSessionCookie(token: string, expiresAt: string): string {
    const expires = new Date(expiresAt).toUTCString();
    return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}`;
}

export function buildClearSessionCookie(): string {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export async function destroySession(
    env: SessionEnv,
    token: string,
): Promise<void> {
    await env.DB.prepare(
        'DELETE FROM session WHERE id = ?',
    )
        .bind(token)
        .run();
}