import { NavLink } from 'react-router';
import { Home, ShoppingCart, Receipt, Store } from 'lucide-react';
import { cn } from '../../lib/utils';

const TABS = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/order', label: 'Order', icon: ShoppingCart },
    { to: '/transaction', label: 'Transaction', icon: Receipt },
    { to: '/store', label: 'Store', icon: Store },
] as const;

export function BottomNav() {
    return (
        <nav className="absolute inset-x-0 bottom-0 border-t border-outline-variant bg-surface px-2 pb-4 pt-2">
            <ul className="flex justify-around">
                {TABS.map(({ to, label, icon: Icon, ...rest }) => (
                    <li key={to}>
                        <NavLink
                            to={to}
                            end={'end' in rest}
                            className={({ isActive }) =>
                                cn(
                                    'flex flex-col items-center gap-1 rounded-full px-4 py-2 text-xs',
                                    isActive
                                        ? 'bg-secondary-container text-on-secondary-container'
                                        : 'text-on-surface-variant'
                                )
                            }
                        >
                            <Icon className="h-5 w-5" />
                            <span>{label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}