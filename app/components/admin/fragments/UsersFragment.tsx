'use client';
import { useEffect, useState, useRef } from 'react';
import { FiSearch, FiMoreVertical, FiCheck, FiX, FiTrash2, FiEye } from 'react-icons/fi';

type User = {
  _id: string;
  email: string;
  role: string;
  status: string;
  name?: string;
  createdAt?: string;
  avatarUrl?: string;
  houseAddress?: string;
  city?: string;
  state?: string;
};

export default function UsersFragment() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  async function load(p = page, l = limit, q = query) {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(p), limit: String(l) });
    if (q) qs.set('q', q);

    try {
      const res = await fetch(`/api/admin/users?${qs.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data.users || []);
      setPage(data.page || 1);
      setLimit(data.limit || l);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1, limit, query);
  }, [limit]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setQuery(searchText.trim());
      load(1, limit, searchText.trim());
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchText]);

  async function updateStatus(id: string, status: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSelectedUser(null);
        load(page, limit, query);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function removeUser(id: string) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedUser(null);
        load(page, limit, query);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'rejected':
      case 'declined':
      case 'suspended': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-96">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Show</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Joined</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="p-4"><div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">No users found matching your criteria.</td></tr>
            ) : users.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold uppercase overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.name?.[0] || user.email[0]
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-white capitalize">{user.name || 'Anonymous User'}</span>
                      <span className="text-sm text-slate-500">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusColor(user.status)}`}>
                    {user.status || 'Active'}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 transition-all"
                    title="View Details"
                  >
                    <FiEye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 px-2">
        <span className="text-sm text-slate-500">
          Showing page <span className="font-semibold text-slate-900 dark:text-white">{page}</span> of <span className="font-semibold">{totalPages}</span>
        </span>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => { setPage(p => p - 1); load(page - 1, limit, query); }}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Previous
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => { setPage(p => p + 1); load(page + 1, limit, query); }}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
          >
            Next
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">User Information</h3>
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-3xl font-bold text-indigo-600 overflow-hidden shadow-inner">
                  {selectedUser.avatarUrl ? (
                    <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    selectedUser.name?.[0] || selectedUser.email[0]
                  )}
                </div>
                <div>
                  <h4 className="text-2xl font-bold capitalize">{selectedUser.name || 'Anonymous User'}</h4>
                  <p className="text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">Role</label>
                  <p className="font-medium text-slate-900 dark:text-white capitalize mt-1">{selectedUser.role}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">Status</label>
                  <p className={`font-bold mt-1 uppercase tracking-wider ${getStatusColor(selectedUser.status).split(' ')[1]}`}>
                    {selectedUser.status || 'Active'}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">Address Information</label>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <p className="text-slate-900 dark:text-white leading-relaxed">
                    {selectedUser.houseAddress ? (
                      <>
                        {selectedUser.houseAddress}<br />
                        {selectedUser.city}, {selectedUser.state}
                      </>
                    ) : (
                      <em className="text-slate-400">Address not provided</em>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
              <button
                onClick={() => removeUser(selectedUser._id)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-all"
              >
                <FiTrash2 /> Delete
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(selectedUser._id, 'rejected')}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl font-medium transition-all"
                >
                  Decline
                </button>
                <button
                  onClick={() => updateStatus(selectedUser._id, 'approved')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 rounded-xl font-medium transition-all"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
