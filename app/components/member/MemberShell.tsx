'use client';
import { useState } from 'react';
import MemberSidebar from './MemberSidebar';
import TicketsFragment from './fragments/TicketsFragment';
import MyPaymentFragment from './fragments/MyPaymentFragment';
import EmailPrefFragment from './fragments/EmailPrefFragment';

type Section = 'tickets'|'payments'|'prefs'|null;

export default function MemberShell() {
  const [active, setActive] = useState<Section>('tickets');
  return (
    <div className="min-h-screen flex bg-white">
      <aside className="w-72 border-r">
        <MemberSidebar active={active} onSelect={s => setActive(s)} />
      </aside>
      <main className="flex-1 p-6">
        {active === 'tickets' && <TicketsFragment />}
        {active === 'payments' && <MyPaymentFragment />}
        {active === 'prefs' && <EmailPrefFragment />}
      </main>
    </div>
  );
}