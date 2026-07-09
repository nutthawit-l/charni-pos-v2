import { Bell, Settings, User } from 'lucide-react';

interface AppBarProps {
    displayName: string;
    avatarUrl?: string | null;
}

export function AppBar({ displayName, avatarUrl }: AppBarProps) {
    return (
        <header className="flex items-center justify-between px-4 pt-4">
            <div className="flex items-center gap-3">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container">
                        <User className="h-5 w-5 text-on-surface-variant" />
                    </div>
                )}
                <h1 className="text-xl font-medium text-on-surface">{displayName}</h1>
            </div>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    aria-label="Notifications"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
                >
                    <Bell className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    aria-label="Settings"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
                >
                    <Settings className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
