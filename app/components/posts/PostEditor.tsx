'use client';
import { useEffect, useRef, useState } from 'react';
import MarkdownEditor from './MarkdownEditor';
import PreviewDraftButton from './PreviewDraftButton';
import {
  Save, Send, Settings, Image as ImageIcon, Tag, X, ChevronRight,
  Loader2, Globe, FileText
} from 'lucide-react';

type Initial = {
  _id?: string;
  title?: string;
  body?: string;
  tags?: string[] | string;
  featureImage?: string;
  status?: 'draft' | 'published';
};

export default function PostEditor({ initialPost, onSaved }: { initialPost?: Initial; onSaved?: (post: any) => void }) {
  const [id, setId] = useState<string | null>(initialPost?._id || null);
  const [title, setTitle] = useState(initialPost?.title || '');
  const [body, setBody] = useState(initialPost?.body || '');
  const [tags, setTags] = useState(Array.isArray(initialPost?.tags) ? (initialPost!.tags as string[]) : (String(initialPost?.tags || '').split(',').map(t => t.trim()).filter(Boolean)));
  const [tagsInput, setTagsInput] = useState(Array.isArray(initialPost?.tags) ? initialPost!.tags.join(', ') : String(initialPost?.tags || ''));
  const [featureImage, setFeatureImage] = useState(initialPost?.featureImage || '');
  const [status, setStatus] = useState<'draft' | 'published'>(initialPost?.status || 'draft');

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const debounceRef = useRef<number | null>(null);
  const lastSaveRef = useRef<number>(0);
  const dirtyRef = useRef(false);

  // Autosave logic
  useEffect(() => {
    const periodic = setInterval(() => {
      const now = Date.now();
      if (dirtyRef.current && now - lastSaveRef.current > 4000) flushSave(true);
    }, 12000);
    return () => clearInterval(periodic);
  }, [title, body, tags, featureImage, status]);

  function scheduleAutosave() {
    dirtyRef.current = true;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => flushSave(true), 4000);
  }

  async function flushSave(isAutoSave = false) {
    if (!title.trim()) return;
    setSaving(true);
    const payload: any = { id, title, body, tags, featureImage, status };
    try {
      const res = await fetch('/api/posts/autosave', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (res.ok && j && j.post) {
        setId(j.post._id ?? id);
        setSavedAt(new Date());
        lastSaveRef.current = Date.now();
        dirtyRef.current = false;
        if (!isAutoSave && onSaved) onSaved(j.post);
      } else {
        // ignore transient failures
        console.error('Autosave failed', j);
      }
    } catch (e) {
      console.error('Autosave error', e);
    } finally {
      setSaving(false);
    }
  }

  // Setters
  const update = (fn: () => void) => { fn(); scheduleAutosave(); };

  return (
    <div className="relative flex min-h-[80vh] gap-6 text-slate-900 dark:text-slate-100">
      {/* Editor Main Area */}
      <div className="flex-1 flex flex-col gap-6">

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {saving ? <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400"><Loader2 className="animate-spin" size={14} /> Saving...</span>
              : savedAt ? <span className="flex items-center gap-1"><Save size={14} /> Saved {savedAt.toLocaleTimeString()}</span>
                : <span>Not saved</span>}
            <span className="text-slate-300 dark:text-slate-700">|</span>
            {status === 'published' ? <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1"><Globe size={14} /> Published</span> : <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><FileText size={14} /> Draft</span>}
          </div>
          <div className="flex items-center gap-2">
            <PreviewDraftButton postId={id} />
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition ${showSettings ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              title="Post Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => { update(() => setStatus('published')); flushSave(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition shadow-sm hover:shadow"
            >
              <Send size={16} /> Publish
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <input
            value={title}
            onChange={e => update(() => setTitle(e.target.value))}
            placeholder="Article Title..."
            className="w-full text-4xl font-extrabold text-slate-900 dark:text-slate-50 placeholder:text-slate-300 dark:placeholder:text-slate-700 border-none outline-none bg-transparent"
          />
        </div>

        {/* Feature Image Preview (Inline) */}
        {featureImage && (
          <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative group">
            <img src={featureImage} alt="Cover" className="w-full h-full object-cover" />
            <button
              className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black/80 rounded-full text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition"
              onClick={() => update(() => setFeatureImage(''))}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Markdown Editor */}
        <div className="flex-1">
          <MarkdownEditor value={body} onChange={v => update(() => setBody(v))} />
        </div>
      </div>

      {/* Settings Panel (Sidebar/Drawer) */}
      <div
        className={`w-80 border-l border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-6 bg-white dark:bg-slate-900 transition-all duration-300 ${showSettings ? 'translate-x-0 opacity-100' : 'translate-x-[20px] opacity-0 pointer-events-none hidden lg:hidden'}`}
      >
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Settings size={18} /> Settings
          </h3>

          <div className="space-y-4">
            {/* Feature Image Input */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Feature Image</label>
              <div className="flex gap-2">
                <input
                  value={featureImage}
                  onChange={e => update(() => setFeatureImage(e.target.value))}
                  placeholder="https://..."
                  className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded focus:border-indigo-500 outline-none transition"
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Paste a URL for the cover image.</p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Tags</label>
              <input
                value={tagsInput}
                onChange={e => {
                  setTagsInput(e.target.value);
                  setTags(e.target.value.split(',').map(s => s.trim()).filter(Boolean));
                  scheduleAutosave();
                }}
                placeholder="news, event, update"
                className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded focus:border-indigo-500 outline-none transition"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Status</label>
              <select
                value={status}
                onChange={e => update(() => setStatus(e.target.value as any))}
                className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded focus:border-indigo-500 outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {id && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-400 font-mono">ID: {id}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
