'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

export default function PostView({ body }: { body: string }) {
  return (
    <div className="prose prose-lg prose-slate max-w-none 
      prose-headings:font-bold prose-headings:text-slate-900 
      prose-p:text-slate-700 prose-p:leading-relaxed 
      prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
      prose-img:rounded-xl prose-img:shadow-sm
      prose-pre:bg-slate-900 prose-pre:text-slate-50
      prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4
      marker:text-indigo-500
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {body || ''}
      </ReactMarkdown>
    </div>
  );
}
