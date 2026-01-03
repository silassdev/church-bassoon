'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    FiHome,
    FiTrello,
    FiCreditCard,
    FiMail,
    FiSettings
} from 'react-icons/fi';

const menuItems = [
    { label: 'Dashboard', href: '/dashboard/member', icon: FiHome },
    { label: 'My Tickets', href: '/dashboard/member/tickets', icon: FiTrello },
    { label: 'My Payments', href: '/dashboard/member/payments', icon: FiCreditCard },
    { label: 'Email Preferences', href: '/dashboard/member/emailpref', icon: FiMail },
];

export default function MemberSidebar({ isCollapsed }: { isCollapsed?: boolean }) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto">
            <div className={`p-6 ${isCollapsed ? 'px-2 flex justify-center' : ''}`}>
                <h2 className={`text-xs font-semibold text-slate-400 uppercase tracking-wider ${isCollapsed ? 'hidden' : ''}`}>
                    Member Menu
                </h2>
                {isCollapsed && <div className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800" />}
            </div>

            <div className={`flex-1 px-4 space-y-1 ${isCollapsed ? 'px-2' : ''}`}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.label : ''}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                            {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                        </Link>
                    );
                })}
            </div>

            <div className={`p-4 border-t border-slate-100 dark:border-slate-800 ${isCollapsed ? 'px-2' : ''}`}>
                <Link
                    href="/dashboard/member/settings"
                    title={isCollapsed ? "Settings" : ""}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                    <FiSettings className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium whitespace-nowrap">Settings</span>}
                </Link>
            </div>
        </nav>
    );
}
