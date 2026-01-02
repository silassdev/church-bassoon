'use client';
import { useState } from 'react';
import CoordinatorSidebar from './CoordinatorSidebar';
import TicketsFragment from './fragments/TicketsFragment';
import PaymentsFragment from './fragments/PaymentsFragment';

type Section = 'tickets'|'payments'|null;

export default function CoordinatorShell() {
  const [active, setActive] = useState<Section>('tickets');
  return (
    <div className="min-h-screen flex bg-white">
      <aside className="w-72 border-r">
        <CoordinatorSidebar active={active} onSelect={s => setActive(s)} />
      </aside>
      <main className="flex-1 p-6">
        {active === 'tickets' && <TicketsFragment />}
        {active === 'payments' && <PaymentsFragment />}
      </main>
    </div>
  );
}
