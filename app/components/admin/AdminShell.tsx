'use client';
import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import OverviewFragment from './fragments/OverviewFragment';
import UsersFragment from './fragments/UsersFragment';
import FinanceFragment from './fragments/FinanceFragment';
import AnnouncementFragment from './fragments/AnnouncementFragment';
import FeedbackFragment from './fragments/FeedbackFragment';
import NewsletterFragment from './fragments/NewsletterFragment';

export type AdminSection = 'overview' | 'users' | 'finance' | 'announcement' | 'feedback' | 'newsletter' | null;

export default function AdminShell() {
  const [active, setActive] = useState<AdminSection>(null); // null = no active clicked (Overview shown)
  function onSelect(section: AdminSection) {
    setActive(section);
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-72 border-r">
        <AdminSidebar onSelect={onSelect} active={active} />
      </aside>

      <main className="flex-1 p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-medium">Admin dashboard</h1>
        </div>

        {active === null && <OverviewFragment />}

        {active === 'users' && <UsersFragment />}
        {active === 'finance' && <FinanceFragment />}
        {active === 'announcement' && <AnnouncementFragment />}
        {active === 'feedback' && <FeedbackFragment />}
        {active === 'newsletter' && <NewsletterFragment />}
      </main>
    </div>
  );
}