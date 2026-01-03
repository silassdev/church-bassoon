'use client';
import { useEffect, useRef, useState } from 'react';
import MarkdownEditor from './MarkdownEditor';
import PreviewDraftButton from './PreviewDraftButton';

type Initial = {
  _id?: string;
  title?: string;
  body?: string;
  tags?: string[] | string;
  featureImage?: string;
  status?: 'draft'|'published';
};

export default function PostEditor({ initialPost, onSaved }: { initialPost?: Initial; onSaved?: (post:any)=>void }) {
  const [id, setId] = useState<string | null>(initialPost?._id || null);
  const [title, setTitle] = useState(initialPost?.title || '');
  const [body, setBody] = useState(initialPost?.body || '');
  const [tags, setTags] = useState(Array.isArray(initialPost?.tags) ? (initialPost!.tags as string[]) : (String(initialPost?.tags || '').split(',').map(t=>t.trim()).filter(Boolean)));
  const [featureImage, setFeatureImage] = useState(initialPost?.featureImage || '');
  const [status, setStatus] = useState<'draft'|'published'>(initialPost?.status || 'draft');

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date|null>(null);
  const debounceRef = useRef<number | null>(null);
  const lastSaveRef = useRef<number>(0);
  const dirtyRef = useRef(false);

  useEffect(() => {
    const periodic = setInterval(() => {
      const now = Date.now();
      if (dirtyRef.current && now - lastSaveRef.current > 4000) flushSave();
    }, 12000);
    return () => clearInterval(periodic);
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      // Attempt a synchronous flush: prefer navigator.sendBeacon
      if (!title.trim()) return;
      const payload = { id, title, body, tags, featureImage, status };
      const url = '/api/posts/autosave/beacon';
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, blob);
        } else {
          // last resort: synchronous XHR (deprecated) - try async fetch but not guaranteed
          // we try fetch but browser may cancel it
          navigatorFetchFallback(url, payload);
        }
      } catch (_) {
        // ignore
      }
      // no need to call flushSave (async) because beforeunload won't wait reliably
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [id, title, body, tags, featureImage, status]);

  // fallback fetch (async) — best-effort only
  function navigatorFetchFallback(url: string, payload: any) {
    try { fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }); } catch (_) {}
  }

  function scheduleAutosave() {
    dirtyRef.current = true;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      flushSave();
    }, 4000);
  }

  async function flushSave() {
    if (!title.trim()) return;
    setSaving(true);
    const payload: any = { id, title, body, tags, featureImage, status };
    try {
      const res = await fetch('/api/posts/autosave', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (res.ok && j && j.post) {
        setId(j.post._id || j.post._id ?? id);
        setSavedAt(new Date());
        lastSaveRef.current = Date.now();
        dirtyRef.current = false;
        if (onSaved) onSaved(j.post);
      } else {
        // ignore transient failures
        console.warn('Autosave failed', j);
      }
    } catch (e) {
      console.warn('Autosave error', e);
    } finally {
      setSaving(false);
    }
  }

  // handlers
  function onTitle(v: string) { setTitle(v); scheduleAutosave(); }
  function onBody(v: string) { setBody(v); scheduleAutosave(); }
  function onTagsVal(v: string) { const arr = v.split(',').map(s=>s.trim()).filter(Boolean); setTags(arr); scheduleAutosave(); }
  function onFeatureImage(v: string) { setFeatureImage(v); scheduleAutosave(); }
  function onPublish() { setStatus('published'); scheduleAutosave(); }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="mb-3 flex items-center gap-3">
        <input value={title} onChange={e => onTitle(e.target.value)} placeholder="Post title" className="flex-1 p-2 border rounded" />
        <div className="text-sm text-slate-500">
          {saving ? <span>Saving…</span> : savedAt ? <span>Saved {savedAt.toLocaleTimeString()}</span> : <span>Not saved</span>}
        </div>
      </div>

      <MarkdownEditor value={body} onChange={onBody} />

      <div className="mt-3 grid grid-cols-3 gap-2">
        <input className="p-2 border rounded" placeholder="tags (comma separated)" value={tags.join(', ')} onChange={e => onTagsVal(e.target.value)} />
        <input className="p-2 border rounded" placeholder="Feature image URL" value={featureImage} onChange={e => onFeatureImage(e.target.value)} />
        <div className="flex items-center gap-2">
        <button
          onClick={() => flushSave()}
          className="px-3 py-1 border rounded" >Save now </button>
        <button
          onClick={onPublish}
          className="px-3 py-1 bg-emerald-600 text-white rounded" >Publish</button>
        <PreviewDraftButton postId={id} />
      </div>

      </div>

      <div className="mt-4 text-sm text-slate-500">
        {id ? <span>Draft ID: {id}</span> : <span>New draft (not yet saved)</span>}
      </div>
    </div>
  );
}
