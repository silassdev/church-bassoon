'use client';
import { useState } from 'react';
import { LayoutDashboard, Activity, MessageSquare } from 'lucide-react';
import OverviewFragment from '@/app/components/admin/fragments/OverviewFragment';
import SiteLogsFragment from '@/app/components/admin/fragments/SiteLogsFragment';
import TicketsFragment from '@/app/components/coordinator/fragments/TicketsFragment';

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'logs'>('overview');

    const tabs = [
        { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
        { id: 'tickets' as const, label: 'Tickets', icon: MessageSquare },
        { id: 'logs' as const, label: 'Site & Logs', icon: Activity },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Tab Navigation */}
            <div className="border-b border-slate-200 dark:border-slate-800">
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all rounded-t-xl ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
                {activeTab === 'overview' && <OverviewFragment />}
                {activeTab === 'tickets' && (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <TicketsFragment />
                    </div>
                )}
                {activeTab === 'logs' && <SiteLogsFragment />}
            </div>
        </div>
    );
}
