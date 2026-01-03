'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const tools = [
  { label: 'B', wrap: '**' },
  { label: 'I', wrap: '*' },
  { label: 'H1', prefix: '# ' },
  { label: 'H2', prefix: '## ' },
  { label: 'List', prefix: '- ' },
  { label: 'Highlight', wrap: '==' },
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
    <div className="border rounded">
      <div className="flex gap-2 border-b p-2">
        {tools.map(t => (
          <button key={t.label} onClick={() => apply(t)} className="px-2 border rounded">
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button onClick={() => setTab('edit')}>Edit</button>
          <button onClick={() => setTab('preview')}>Preview</button>
        </div>
      </div>

      {tab === 'edit' ? (
        <textarea
          className="w-full p-3 min-h-[300px]"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <div className="p-4 prose max-w-none">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
