import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function SettingsHeader() {
    const navigate = useNavigate();

    return (
        <header className="flex shrink-0 items-center px-2 py-2">
            <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface"
            >
                <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-[22px] font-normal text-on-surface">Settings</h1>
        </header>
    );
}
