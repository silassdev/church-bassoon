'use client';
import { useEffect, useState, useRef } from 'react';

type User = { _id: string; email: string; role: string; status: string; name?: string; createdAt?: string };

export default function UsersFragment() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [searchText, setSearchText] = useState('');
  const debounceRef = useRef<number | null>(null);

  async function load(p = page, l = limit, q = query) {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(p), limit: String(l) });
    if (q) qs.set('q', q);
    const res = await fetch(`/api/admin/users?${qs.toString()}`);
    if (!res.ok) {
      setUsers([]);
      setTotalPages(1);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setUsers(data.users || []);
    setPage(data.page || 1);
    setLimit(data.limit || l);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }

  useEffect(() => { load(1, limit, query); }, [limit]); // reload when limit changes

  // debounced search
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setPage(1);
      setQuery(searchText.trim());
      load(1, limit, searchText.trim());
    }, 450);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [searchText]);

  function goTo(p: number) {
    const newPage = Math.max(1, Math.min(totalPages, p));
    setPage(newPage);
    load(newPage, limit, query);
  }

  async function removeUser(id: string) {
    if (!confirm('Delete user?')) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) load(page, limit, query);
    else alert('Delete failed');
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Users</h2>

      <div className="mb-4 p-4 bg-white rounded shadow grid grid-cols-3 gap-3 items-center">
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Search by email, name or role"
          className="p-2 border rounded col-span-2"
        />

        <div className="flex items-center gap-2 justify-end">
          <label className="text-sm">Per page</label>
          <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="p-2 border rounded">
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="text-left">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-4">No users found</td></tr>
            ) : users.map(u => (
              <tr key={u._id} className="border-t">
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.name || '-'}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.status}</td>
                <td className="p-3">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                <td className="p-3">
                  <button className="mr-2 text-sm" onClick={() => alert('Edit UI not implemented')}>Edit</button>
                  <button className="text-sm text-red-600" onClick={() => removeUser(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-slate-600">Page {page} of {totalPages}</div>
        <div className="flex gap-2">
          <button onClick={() => goTo(1)} disabled={page === 1} className="px-3 py-1 border rounded">First</button>
          <button onClick={() => goTo(page - 1)} disabled={page === 1} className="px-3 py-1 border rounded">Prev</button>
          <button onClick={() => goTo(page + 1)} disabled={page === totalPages} className="px-3 py-1 border rounded">Next</button>
          <button onClick={() => goTo(totalPages)} disabled={page === totalPages} className="px-3 py-1 border rounded">Last</button>
        </div>
      </div>
    </div>
  );
}
