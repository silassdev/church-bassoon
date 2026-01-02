'use client';
import { AdminSection } from './AdminShell';

export default function AdminSidebar({ onSelect, active }: { onSelect: (s: AdminSection) => void; active: AdminSection; }) {
  const items: { key: AdminSection; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'finance', label: 'Finance' },
    { key: 'announcement', label: 'Announcement' },
    { key: 'feedback', label: 'Feedback' },
    { key: 'newsletter', label: 'Email / Newsletter' },
  ];

  return (
    <nav className="p-4">
      <div className="mb-6 text-lg font-semibold">Admin</div>
      <ul className="space-y-1">
        {items.map(i => {
          const isActive = active === i.key;
          return (
            <li key={i.key}>
              <button
                onClick={() => onSelect(i.key)}
                className={`w-full text-left px-3 py-2 rounded ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100'}`}
              >
                {i.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}