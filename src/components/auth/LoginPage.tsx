import { useState } from 'react';
import { ArrowLeft, Circle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { OutlinedTextField } from '../store/OutlinedTextField';
import { SocialLoginButton } from './SocialLoginButton';

interface LoginPageProps {
    returnTo?: string;
}

export function LoginPage({ returnTo }: LoginPageProps) {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    async function handleSignIn() {
        setError(null);
        setIsPending(true);
        try {
            const res = await fetch('/api/auth/phone', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, rememberMe }),
            });
            if (res.status === 401) {
                setError('Phone number not registered');
                return;
            }
            if (!res.ok) {
                setError('Sign in failed');
                return;
            }
            navigate(returnTo ?? '/');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="flex h-dvh justify-center bg-surface">
            <div className="flex h-dvh w-full max-w-[400px] flex-col overflow-hidden bg-surface shadow-2xl">
                <header className="flex shrink-0 items-center px-2 py-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 no-scrollbar">
                    <div
                        className="mx-auto mt-6 h-36 w-36 rounded-full bg-primary"
                        aria-hidden
                    />

                    <h1 className="mt-8 text-center text-[36px] font-medium leading-tight text-on-surface">
                        Login to Your Account
                    </h1>

                    <div className="mt-8 flex flex-col gap-4">
                        <OutlinedTextField
                            label="Tel"
                            type="tel"
                            value={phone}
                            onChange={setPhone}
                            placeholder="+66 00 000 0000"
                            alwaysFloatLabel
                        />

                        <label className="mt-2 flex cursor-pointer items-center justify-center gap-2">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-[18px] w-[18px] rounded border-outline-variant accent-primary"
                            />
                            <span className="text-base text-on-surface">Remember me</span>
                        </label>
                    </div>

                    {error && (
                        <p className="mt-4 text-center text-sm text-red-600">{error}</p>
                    )}

                    <div className="mt-6 flex justify-center">
                        <button
                            type="button"
                            onClick={handleSignIn}
                            disabled={isPending}
                            className="h-14 rounded-full bg-primary px-6 text-base font-medium text-on-primary disabled:opacity-50"
                        >
                            {isPending ? 'Signing in…' : 'Sign in'}
                        </button>
                    </div>
                </div>

                <footer className="shrink-0 px-4 pb-8">
                    <div className="border-t border-outline-variant" />
                    <div className="mt-8 flex gap-2">
                        <SocialLoginButton label="Facebook" icon={Circle} />
                        <SocialLoginButton label="Google" icon={Circle} />
                        <SocialLoginButton label="Apple" icon={Circle} />
                    </div>

                    <p className="mt-6 text-center text-sm">
                        <span className="text-primary">Don&apos;t have an account? </span>
                        <button type="button" className="font-medium text-primary">
                            Sign up
                        </button>
                    </p>
                </footer>
            </div>
        </div>
    );
}
