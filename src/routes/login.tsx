import { redirect } from 'react-router';
import type { Route } from './+types/login';
import { LoginPage } from '../components/auth/LoginPage';

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
    const res = await fetch('/api/users/profile', { credentials: 'include' });
    if (res.ok) {
        const url = new URL(request.url);
        throw redirect(url.searchParams.get('returnTo') ?? '/');
    }
    const url = new URL(request.url);
    return { returnTo: url.searchParams.get('returnTo') };
}

clientLoader.hydrate = true as const;

export default function LoginRoute({ loaderData }: Route.ComponentProps) {
    return <LoginPage returnTo={loaderData?.returnTo ?? undefined} />;
}
