// components/ui/ProfileModal.tsx  (replace with this)
'use client';
import { useEffect, useState } from 'react';

type Props = { open: boolean; onClose: () => void };

export default function ProfileModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [houseAddress, setHouseAddress] = useState('');
  const [dob, setDob] = useState<string | null>(null); // yyyy-mm-dd
  const [stateField, setStateField] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setEmail(data.email || '');
        setName(data.name || '');
        setHouseAddress(data.houseAddress || '');
        setDob(data.dob || null);
        setStateField(data.state || '');
        setCity(data.city || '');
        setAvatarUrl(data.avatarUrl || null);
        setError(null);
      } catch (e:any) {
        setError('Unable to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  async function handleAvatarFile(file?: File | null) {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const maxBytes = Number(process.env.NEXT_PUBLIC_MAX_AVATAR_BYTES || 2097152);
      if (file.size > maxBytes) {
        setError('Avatar too large');
        setAvatarUploading(false);
        return;
      }
      const reader = new FileReader();
      const dataUrl: string = await new Promise((res, rej) => {
        reader.onload = () => res(String(reader.result));
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

      const payload = { filename: file.name, data: dataUrl };
      const r = await fetch('/api/profile/avatar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok) {
        setError(j?.error || 'Upload failed');
        setAvatarUploading(false);
        return;
      }
      setAvatarUrl(j.url);
      setAvatarUploading(false);
    } catch (e) {
      setError('Upload error');
      setAvatarUploading(false);
    }
  }
  async function handleRevertToDefault() {
  if (!confirm('Revert to a random default avatar?')) return;
  try {
    const res = await fetch('/api/profile/avatar/remove', { method: 'POST' });
    const j = await res.json();
    if (!res.ok) {
      setError(j?.error || 'Failed to revert avatar');
      return;
    }
    setAvatarUrl(j.avatarUrl || null);
    // if server returns thumbnail, you may store it too if you show thumbs separately
    setError(null);
  } catch (e) {
    setError('Network error');
  }
}


  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (name.length > 100) { setError('Name is too long'); setSaving(false); return; }
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, houseAddress, dob, state: stateField, city }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === 'validation' && data.details) {
          const first = Object.values(data.details)[0] as string;
          setError(first || 'Validation error');
        } else {
          setError(data?.error || 'Save failed');
        }
        setSaving(false);
        return;
      }
      // optionally update avatarUrl on client if server recomputed it
      setSaving(false);
      onClose();
    } catch (e) {
      setError('Network error');
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Update Profile</h3>
          <button onClick={onClose} className="text-sm text-slate-600">Close</button>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm mb-1">Avatar</label>
                <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                  {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="text-xs text-slate-500">No avatar</div>}
                </div>
              </div>

              <div>
                <label className="block text-sm">Upload avatar</label>
                <input type="file" accept="image/*" onChange={e => handleAvatarFile(e.target.files?.[0] || null)} />
                {avatarUploading && <div className="text-xs text-slate-500 mt-1">Uploading…</div>}
              </div>
            </div>

            <div>
              <label className="block text-sm">Email (readonly)</label>
              <input value={email} readOnly className="w-full p-2 border rounded bg-slate-50" />
            </div>

            <div>
              <label className="block text-sm">Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm">House Address</label>
              <textarea value={houseAddress} onChange={e => setHouseAddress(e.target.value)} className="w-full p-2 border rounded" rows={3} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm">DOB</label>
                <input type="date" value={dob || ''} onChange={e => setDob(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm">State</label>
                <input value={stateField} onChange={e => setStateField(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm">City</label>
                <input value={city} onChange={e => setCity(e.target.value)} className="w-full p-2 border rounded" />
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded">{saving ? 'Saving…' : 'Save changes'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


// inside ProfileModal component, near avatar display area
// add handler
