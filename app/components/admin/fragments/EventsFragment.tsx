'use client';
import { useEffect, useState } from 'react';

type Ev = any;

export default function EventsFragment() {
  const [items, setItems] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(false);

  // create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  useEffect(() => {
    load();
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/events/stream');
      es.onmessage = ev => {
        try {
          const p = JSON.parse(ev.data);
          if (p && (p.action === 'init' || p.action === 'update')) setItems(p.events || []);
        } catch {}
      };
      es.onerror = () => { es?.close(); };
    } catch {}
    return () => es?.close();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/events/preview');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  async function createEvent() {
    if (!title || !startAt || !endAt) return alert('Title, start and end required');
    const res = await fetch('/api/admin/events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title, description, startAt, endAt, location, url, bannerUrl }) });
    if (!res.ok) {
      const j = await res.json(); return alert(j.error || 'Failed');
    }
    setTitle(''); setDescription(''); setStartAt(''); setEndAt(''); setLocation(''); setUrl(''); setBannerUrl('');
    // SSE will update
  }

  async function remove(id: string) {
    if (!confirm('Delete event?')) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    if (!res.ok) { const j = await res.json(); alert(j.error || 'Delete failed'); return; }
    // SSE will update
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Events</h2>

      <div className="mb-4 bg-white p-4 rounded shadow">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded mb-2" />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border rounded mb-2" rows={3} />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="datetime-local" value={startAt} onChange={e=>setStartAt(e.target.value)} className="p-2 border rounded" />
          <input type="datetime-local" value={endAt} onChange={e=>setEndAt(e.target.value)} className="p-2 border rounded" />
        </div>
        <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" className="w-full p-2 border rounded mb-2" />
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="URL (zoom, whatsapp, details)" className="w-full p-2 border rounded mb-2" />
        <input value={bannerUrl} onChange={e=>setBannerUrl(e.target.value)} placeholder="Banner image url" className="w-full p-2 border rounded mb-2" />
        <div className="text-right"><button onClick={createEvent} className="px-4 py-2 bg-indigo-600 text-white rounded">Create Event</button></div>
      </div>

      <div className="bg-white rounded shadow">
        {loading ? <div className="p-4">Loading…</div> : items.map((e:any) => (
          <div key={e._id} className="p-3 border-b">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{e.title} {new Date(e.endAt).getTime() <= Date.now() && <span className="text-xs text-slate-500 ml-2">[past]</span>}</div>
                <div className="text-sm text-slate-500">{new Date(e.startAt).toLocaleString()} — {new Date(e.endAt).toLocaleString()}</div>
                <div className="text-sm">{e.location} {e.url && <a className="ml-2 text-indigo-600" href={e.url}>Link</a>}</div>
              </div>
              <div className="flex flex-col gap-2">
                <a className="text-sm text-indigo-600" href={`/admin/events/${e._id}/edit`}>Edit</a>
                <button onClick={()=>remove(e._id)} className="text-sm text-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
