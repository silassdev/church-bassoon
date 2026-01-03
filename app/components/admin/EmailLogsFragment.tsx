'use client';
import { useEffect, useState } from 'react';

export default function EmailLogsFragment() {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(()=> load(), [page]);

  async function load() {
    const res = await fetch(`/api/admin/email-logs?page=${page}&limit=20`);
    if (!res.ok) return;
    const j = await res.json();
    setLogs(j.items || []);
  }

  async function resend(id:string) {
    const res = await fetch(`/api/admin/email-logs/${id}/resend`, { method: 'POST' });
    if (!res.ok) return alert('Resend failed');
    alert('Resent (check log)');
    load();
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Email Logs</h2>
      <div className="bg-white rounded shadow overflow-auto">
        {logs.map(l => (
          <div key={l._id} className="p-3 border-b">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{l.templateName} → {l.to} • {l.status}</div>
                <div className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleString()} {l.sentAt ? ` • sent ${new Date(l.sentAt).toLocaleString()}` : ''}</div>
                <div className="mt-1 text-sm">{l.subject}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={()=>resend(l._id)} className="px-3 py-1 border rounded text-sm">Resend</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
