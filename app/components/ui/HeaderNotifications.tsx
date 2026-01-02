'use client';
import useNotifications from './useNotifications';
import { useState } from 'react';

export default function HeaderNotifications() {
  const { items, unreadCount, reload } = useNotifications();
  const [open, setOpen] = useState(false);

  async function markRead(id: string) {
    await fetch('/api/notifications/mark-read', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ id })});
    reload();
  }

  return (
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="relative">
        <svg className="w-6 h-6" /* bell icon */ viewBox="0 0 24 24" fill="none"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {unreadCount > 0 && <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5">{unreadCount}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border rounded shadow z-50">
          <div className="p-2 border-b flex justify-between items-center">
            <div className="text-sm font-medium">Notifications</div>
            <button className="text-xs text-indigo-600" onClick={()=>{ /* could implement mark-all-read */ }}>Mark all</button>
          </div>
          <div className="max-h-80 overflow-auto">
            {items.length === 0 ? <div className="p-3 text-sm text-slate-500">No notifications</div> :
              items.map(n => (
                <div key={n._id} className={`p-3 border-b ${n.read ? '' : 'bg-slate-50'}`}>
                  <div className="flex justify-between">
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {n.body && <div className="text-sm text-slate-700 mt-1">{n.body}</div>}
                  <div className="mt-2 text-right">
                    {!n.read && <button onClick={()=>markRead(n._id)} className="text-xs text-indigo-600">Mark read</button>}
                    {n.url && <a href={n.url} className="ml-3 text-xs text-indigo-600">Open</a>}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
