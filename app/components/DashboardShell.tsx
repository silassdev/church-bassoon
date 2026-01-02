'use client';
import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface DashboardShellProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}

export default function DashboardShell({ sidebar, children }: DashboardShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            <aside
                className={`relative transition-all duration-300 ease-in-out border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 flex-shrink-0 ${isCollapsed ? 'w-20' : 'w-64'
                    }`}
            >
                {/* Pass collapsed state to sidebar via cloneElement or context, 
            but since sidebar is passed as a prop, we need to handle it.
            Actually, it's easier to just pass the state down if we render the sidebars here.
        */}
                <div className="h-full overflow-hidden">
                    {React.Children.map(sidebar, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child as React.ReactElement<any>, { isCollapsed });
                        }
                        return child;
                    })}
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-10 w-6 h-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors z-20"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
                </button>
            </aside>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-slate-950">
                {children}
            </main>
        </div>
    );
}
