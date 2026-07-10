import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import { SettingsListItem } from '../components/settings/SettingsListItem';

export const handle = { hideBottomNav: true };

export default function SettingsPage() {
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // Cookie clear is the goal; navigate regardless of API errors
        }
        navigate('/login');
    }

    return (
        <div className="flex h-full flex-col">
            <SettingsHeader />
            <div className="px-2">
                <SettingsListItem label="Logout" icon={LogOut} onClick={handleLogout} />
            </div>
        </div>
    );
}
