'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

export default function PostView({ body }: { body: string }) {
  return (
    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none 
      prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100
      prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed 
      prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
      prose-img:rounded-xl prose-img:shadow-sm
      prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-pre:text-slate-50
      prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:py-2 prose-blockquote:px-4
      marker:text-indigo-500 dark:marker:text-indigo-400
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {body || ''}
      </ReactMarkdown>
    </div>
  );
}
