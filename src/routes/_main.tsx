import { Outlet, useMatches } from 'react-router';
import { BottomNav } from '../components/layout/BottomNav';

export default function MainLayout() {
    const matches = useMatches();
    const hideBottomNav = matches.some(
        (match) => (match.handle as { hideBottomNav?: boolean } | undefined)?.hideBottomNav,
    );

    return (
        <div className="flex h-dvh justify-center bg-surface">
            <div className="relative flex h-dvh w-full max-w-[400px] flex-col overflow-hidden bg-surface shadow-2xl">
                <div
                    className={`flex min-h-0 flex-1 flex-col overflow-hidden${hideBottomNav ? '' : ' pb-20'}`}
                >
                    <Outlet />
                </div>
                {!hideBottomNav && <BottomNav />}
            </div>
        </div>
    );
}