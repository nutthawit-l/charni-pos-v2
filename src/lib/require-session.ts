import { redirect } from 'react-router';

export async function requireSession(request: Request) {
    const res = await fetch('/api/users/profile', { credentials: 'include' });
    if (res.status === 401) {
        const url = new URL(request.url);
        const returnTo = url.pathname + url.search;
        throw redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
    if (!res.ok) {
        throw new Response('Failed to load profile', { status: res.status });
    }
    return res.json();
}
