'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bold, Italic, Heading1, Heading2, List, Highlighter, Eye, Edit2,
  Code, Quote, Link as LinkIcon
} from 'lucide-react';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

const tools = [
  { label: 'Bold', icon: <Bold size={16} />, wrap: '**' },
  { label: 'Italic', icon: <Italic size={16} />, wrap: '*' },
  { label: 'H1', icon: <Heading1 size={16} />, prefix: '# ' },
  { label: 'H2', icon: <Heading2 size={16} />, prefix: '## ' },
  { label: 'List', icon: <List size={16} />, prefix: '- ' },
  { label: 'Code', icon: <Code size={16} />, wrap: '`' },
  { label: 'Quote', icon: <Quote size={16} />, prefix: '> ' },
];

export default function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  function apply(tool: any) {
    if (tool.wrap) onChange(value + tool.wrap + 'text' + tool.wrap);
    if (tool.prefix) onChange(value + '\n' + tool.prefix);
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm transition-shadow focus-within:shadow-md">
      <div className="flex items-center gap-1 border-b border-slate-100 p-2 bg-slate-50">
        {tools.map(t => (
          <button
            key={t.label}
            onClick={() => apply(t)}
            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-200 rounded transition"
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
        <div className="ml-auto flex items-center bg-slate-200 rounded p-1">
          <button
            onClick={() => setTab('edit')}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition ${tab === 'edit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Edit2 size={12} /> Write
          </button>
          <button
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition ${tab === 'preview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Eye size={12} /> Preview
          </button>
        </div>
      </div>

      {tab === 'edit' ? (
        <textarea
          className="w-full p-4 min-h-[400px] outline-none text-slate-700 font-mono text-sm resize-y"
          placeholder="Write your story..."
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <div className="p-6 prose prose-slate max-w-none min-h-[400px] bg-white">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {value}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
