'use client';
import { useEffect, useState } from 'react';

type Ann = { _id: string; text: string; addedByName?: string; addedByRole?: string; active?: boolean; createdAt?: string };

export default function AnnouncementFragment() {
  const [items, setItems] = useState<Ann[]>([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/announcements/preview');
    if (res.ok) {
      const arr = await res.json();
      setItems(arr);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // subscribe SSE
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/announcements/stream');
      es.onmessage = ev => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload && (payload.action === 'init' || payload.action === 'update')) {
            setItems(payload.announcements || []);
          }
        } catch {}
      };
      es.onerror = () => { es?.close(); };
    } catch {}
    return () => { es?.close(); };
  }, []);

  async function createAnnouncement() {
    if (!text.trim()) return alert('Enter text');
    const res = await fetch('/api/admin/announcements', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
    if (!res.ok) {
      const j = await res.json(); alert(j?.error || 'Failed');
      return;
    }
    setText('');
    // SSE will update list automatically
  }

  function startEdit(a: Ann) { setEditingId(a._id); setEditText(a.text); }

  async function saveEdit() {
    if (!editingId) return;
    const res = await fetch(`/api/admin/announcements/${editingId}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: editText }) });
    if (!res.ok) { const j = await res.json(); alert(j?.error || 'Failed'); return; }
    setEditingId(null); setEditText('');
  }

  async function remove(id: string) {
    if (!confirm('Delete announcement?')) return;
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    if (!res.ok) { const j = await res.json(); alert(j?.error || 'Failed'); return; }
    // SSE will update list
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Announcements</h2>

      <div className="mb-4 p-4 bg-white rounded shadow">
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3} className="w-full p-2 border rounded" placeholder="New announcement" />
        <div className="text-right mt-2">
          <button onClick={createAnnouncement} className="px-4 py-2 bg-indigo-600 text-white rounded">Post</button>
        </div>
      </div>

      <div className="bg-white rounded shadow">
        {loading ? <div className="p-4">Loading…</div> :
          items.map(a => (
            <div key={a._id} className="p-3 border-b">
              <div className="flex justify-between">
                <div>
                  <div className="text-sm text-slate-600">{a.addedByName} • {a.addedByRole}</div>
                  {editingId === a._id ? (
                    <textarea value={editText} onChange={e => setEditText(e.target.value)} className="w-full p-2 border rounded" />
                  ) : <div className="mt-1">{a.text}</div>}
                </div>
                <div className="flex flex-col gap-2">
                  {editingId === a._id ? (
                    <>
                      <button onClick={saveEdit} className="px-2 py-1 bg-emerald-600 text-white rounded text-sm">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-2 py-1 border rounded text-sm">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(a)} className="px-2 py-1 border rounded text-sm">Edit</button>
                      <button onClick={() => remove(a._id)} className="px-2 py-1 text-red-600 rounded border text-sm">Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
