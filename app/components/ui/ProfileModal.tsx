'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCamera, FiUser, FiMapPin, FiCalendar, FiMail, FiRefreshCw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

type Props = { open: boolean; onClose: () => void };

export default function ProfileModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [houseAddress, setHouseAddress] = useState('');
  const [dob, setDob] = useState<string | null>(null); // yyyy-mm-dd
  const [stateField, setStateField] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setSuccess(false);
      setError(null);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setEmail(data.email || '');
        setName(data.name || '');
        setHouseAddress(data.houseAddress || '');
        setDob(data.dob ? new Date(data.dob).toISOString().split('T')[0] : null);
        setStateField(data.state || '');
        setCity(data.city || '');
        setAvatarUrl(data.avatarUrl || null);
        setError(null);
      } catch (e: any) {
        setError('Unable to load profile data');
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  async function handleAvatarFile(file?: File | null) {
    if (!file) return;
    setAvatarUploading(true);
    setError(null);
    try {
      const maxBytes = 2 * 1024 * 1024; // 2MB default
      if (file.size > maxBytes) {
        setError('Avatar image is too large (max 2MB)');
        setAvatarUploading(false);
        return;
      }
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const payload = { filename: file.name, data: dataUrl };
      const r = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const j = await r.json();
      if (!r.ok) {
        setError(j?.error || 'Upload failed');
        setAvatarUploading(false);
        return;
      }
      setAvatarUrl(j.url);
      setAvatarUploading(false);
    } catch (e) {
      setError('An error occurred during upload');
      setAvatarUploading(false);
    }
  }

  async function handleRevertToDefault() {
    if (!confirm('Revert to default avatar?')) return;
    try {
      const res = await fetch('/api/profile/avatar/remove', { method: 'POST' });
      const j = await res.json();
      if (!res.ok) {
        setError(j?.error || 'Failed to revert avatar');
        return;
      }
      setAvatarUrl(j.avatarUrl || null);
      setError(null);
    } catch (e) {
      setError('Network error');
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, houseAddress, dob, state: stateField, city }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to save changes');
        setSaving(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (e) {
      setError('Network error: Could not reach server');
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiUser className="text-indigo-600" />
                Profile Settings
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Loading your profile...</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="overflow-y-auto max-h-[calc(100vh-160px)]">
                <div className="p-8 space-y-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center sm:flex-row gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-xl">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-indigo-200">
                            <FiUser className="w-16 h-16" />
                          </div>
                        )}
                        {avatarUploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <FiRefreshCw className="w-8 h-8 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-all hover:scale-110">
                        <FiCamera className="w-5 h-5" />
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleAvatarFile(e.target.files?.[0])} />
                      </label>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">Profile Picture</h4>
                      <p className="text-sm text-slate-500 mb-4">Update your photo or revert to the default.</p>
                      <button
                        type="button"
                        onClick={handleRevertToDefault}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        Revert to default
                      </button>
                    </div>
                  </div>

                  {/* Personal Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <FiMail className="w-4 h-4" /> Email Address
                      </label>
                      <input
                        value={email}
                        readOnly
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-75"
                        title="Email cannot be changed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <FiUser className="w-4 h-4" /> Full Name
                      </label>
                      <input
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" /> Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob || ''}
                        onChange={e => setDob(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <FiMapPin className="w-4 h-4" /> State
                      </label>
                      <input
                        value={stateField}
                        onChange={e => setStateField(e.target.value)}
                        placeholder="State / Region"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl transition-all"
                      />
                    </div>
                  </div>

                  {/* Full Address */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">City</label>
                      <input
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="Your City"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Street Address</label>
                      <textarea
                        value={houseAddress}
                        onChange={e => setHouseAddress(e.target.value)}
                        placeholder="Apt, Suite, Street Address"
                        rows={3}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Status Messages */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 text-sm font-medium"
                      >
                        <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3 text-sm font-medium"
                      >
                        <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                        Profile updated successfully!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {saving && <FiRefreshCw className="animate-spin" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
