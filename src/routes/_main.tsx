import { Outlet } from 'react-router';
import { BottomNav } from '../components/layout/BottomNav';

export default function MainLayout() {
    return (
        <div className="flex h-dvh justify-center bg-surface">
            <div className="relative flex h-dvh w-full max-w-[400px] flex-col overflow-hidden bg-surface shadow-2xl">
                <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                    <Outlet />
                </div>
                <BottomNav />
            </div>
        </div>
    )
}