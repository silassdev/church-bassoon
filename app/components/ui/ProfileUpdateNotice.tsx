'use client';
import { useEffect, useState } from 'react';

export default function ProfileUpdateNotice() {
  const [notice, setNotice] = useState<{ show: boolean; message?: string; missing?: string[] } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await fetch('/api/profile/notice');
      if (!r.ok) return;
      const j = await r.json();
      if (mounted) setNotice(j);
    })();
    return () => { mounted = false; };
  }, []);

  if (!notice || !notice.show) return null;

  async function dismiss() {
    await fetch('/api/profile/dismiss-notice', { method: 'POST' });
    setNotice({ show: false });
  }

  return (
    <div className="w-full bg-yellow-50 border-y border-yellow-200 py-2">
      <div className="max-w-screen-xl mx-auto px-4 flex items-start justify-between gap-4">
        <div className="text-sm">
          <strong className="mr-2">Profile update:</strong>
          <span>{notice.message}</span>
          {notice.missing && notice.missing.length > 0 && (
            <div className="mt-1 text-xs text-slate-600">Missing: {notice.missing.join(', ')}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a href="/profile/edit" className="text-sm text-indigo-600">Update now</a>
          <button onClick={dismiss} aria-label="dismiss" className="text-slate-600">✕</button>
        </div>
      </div>
    </div>
  );
}
