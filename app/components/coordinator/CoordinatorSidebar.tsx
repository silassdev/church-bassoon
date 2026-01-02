'use client';
export default function CoordinatorSidebar({ active, onSelect }: { active:any; onSelect:(s:any)=>void }) {
  const items = [{ key: 'tickets', label: 'Tickets' }, { key: 'payments', label: 'Payments' }];
  return (
    <nav className="p-4">
      <div className="mb-4 text-lg font-semibold">Coordinator</div>
      <ul className="space-y-2">
        {items.map(i => (
          <li key={i.key}>
            <button onClick={() => onSelect(i.key)} className={`w-full text-left px-3 py-2 rounded ${active === i.key ? 'bg-emerald-600 text-white' : 'hover:bg-slate-50'}`}>{i.label}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}