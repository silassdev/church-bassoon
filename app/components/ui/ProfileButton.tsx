'use client';
import { useState } from 'react';
import ProfileModal from './ProfileModal';

export default function ProfileButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <svg className="w-6 h-6 rounded-full bg-slate-200" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4.5 20a7.5 7.5 0 0115 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <span className="sr-only">Open profile</span>
      </button>

      <ProfileModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}