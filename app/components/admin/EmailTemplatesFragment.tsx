'use client';
import { useEffect, useState } from 'react';

export default function EmailTemplatesFragment() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selected, setSelected] = useState<{templateName:string, locale:string}|null>(null);
  const [tpl, setTpl] = useState<any>(null);

  useEffect(()=> loadList(), []);

  async function loadList() {
    const res = await fetch('/api/admin/email-templates');
    if (res.ok) setTemplates(await res.json());
  }

  async function openTemplate(name:string, locale='en') {
    const res = await fetch(`/api/admin/email-templates/${encodeURIComponent(name)}/${locale}`);
    if (!res.ok) return alert('Failed to load');
    const j = await res.json();
    setSelected({ templateName: name, locale });
    setTpl(j);
  }

  async function save() {
    if (!selected || !tpl) return;
    const body = { templateName: selected.templateName, locale: selected.locale, subject: tpl.subject, html: tpl.html, text: tpl.text };
    const res = await fetch('/api/admin/email-templates', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) });
    if (res.ok) { alert('Saved'); loadList(); }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Email Templates</h2>
      <div className="flex gap-4">
        <div className="w-1/3 bg-white p-3 rounded shadow">
          <div className="font-medium mb-2">Overrides</div>
          {templates.map(t=>(
            <div key={`${t.templateName}-${t.locale}`} className="py-1 border-b flex justify-between">
              <div>{t.templateName} • {t.locale}</div>
              <button onClick={()=>openTemplate(t.templateName,t.locale)} className="text-xs border px-2">Edit</button>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-white p-3 rounded shadow">
          {selected ? (
            <>
              <div className="mb-2 font-medium">Editing: {selected.templateName} ({selected.locale})</div>
              <input value={tpl?.subject||''} onChange={e=>setTpl({...tpl, subject: e.target.value})} className="w-full p-2 border rounded mb-2" />
              <textarea value={tpl?.html||''} onChange={e=>setTpl({...tpl, html: e.target.value})} rows={8} className="w-full p-2 border rounded mb-2" />
              <textarea value={tpl?.text||''} onChange={e=>setTpl({...tpl, text: e.target.value})} rows={4} className="w-full p-2 border rounded mb-2" />
              <div className="text-right"><button onClick={save} className="px-4 py-2 bg-indigo-600 text-white rounded">Save Override</button></div>
            </>
          ) : <div>Pick a template to edit (or create a new override via POST to /api/admin/email-templates)</div>}
        </div>
      </div>
    </div>
  );
}
