'use client';
import { useEffect, useState } from 'react';
import {
  Plus,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  MoreVertical,
  CircleDollarSign,
  TrendingUp,
  History,
  AlertCircle,
  Banknote,
  LayoutGrid,
  List as ListIcon,
  Trash2
} from 'lucide-react';

export default function FinanceFragment() {
  const [options, setOptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('tithes');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  async function load() {
    setLoading(true);
    try {
      const [oRes, pRes] = await Promise.all([
        fetch('/api/admin/payment-options'),
        fetch('/api/admin/payments')
      ]);

      if (oRes.ok) setOptions(await oRes.json());

      if (pRes.ok) {
        const data = await pRes.json();
        setPayments(Array.isArray(data) ? data : (data.items || []));
      }
    } catch (error) {
      console.error('Failed to load finance data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createOption() {
    if (!title) return;
    const res = await fetch('/api/admin/payment-options', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title,
        type,
        amount: amount ? Number(amount) : null,
        description: desc
      })
    });
    if (res.ok) {
      setTitle('');
      setAmount('');
      setDesc('');
      load();
    }
  }

  async function approve(paymentId: string, decision: 'approved' | 'decline') {
    const note = prompt('Note (optional)') || '';
    const res = await fetch(`/api/admin/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        decision: decision === 'approved' ? 'approve' : 'decline',
        note
      })
    });
    if (res.ok) load();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'decline': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      case 'coordinator_marked_paid': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 size={14} />;
      case 'decline': return <XCircle size={14} />;
      case 'coordinator_marked_paid': return <Clock size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <CircleDollarSign className="text-indigo-600" size={32} />
            Finance Center
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage payment methods, track contributions and approve payments.</p>
        </div>

        <div className="flex gap-3">
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Approvals</div>
              <div className="text-xl font-bold dark:text-white">
                {payments.filter(p => p.status === 'coordinator_marked_paid').length}
              </div>
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Approved</div>
              <div className="text-xl font-bold dark:text-white">
                {payments.filter(p => p.status === 'approved').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Create Option & List Options */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Banknote size={120} />
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Plus className="text-indigo-600" size={20} />
              New Payment Option
            </h3>

            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Special Project Offering"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                  >
                    <option value="tithes">Tithes</option>
                    <option value="offerings">Offerings</option>
                    <option value="budget">Budget</option>
                    <option value="one_tenth">One tenth</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                    <input
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="Fixed?"
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Description</label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Briefly explain what this is for..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                />
              </div>

              <button
                onClick={createOption}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Create Option
              </button>
            </div>
          </div>

          {/* Payment Options List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <LayoutGrid className="text-indigo-600" size={20} />
                Existing Options
              </span>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{options.length}</span>
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {options.map(opt => (
                <div key={opt._id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 transition group">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-indigo-600 transition">
                      {opt.title}
                    </h4>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {opt.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {opt.description || 'No description provided.'}
                  </div>
                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                      {opt.amount ? `₦${opt.amount.toLocaleString()}` : 'Flexible'}
                    </span>
                    <button className="text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {options.length === 0 && (
                <div className="text-center py-8 text-slate-400 italic text-sm">
                  No payment options found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Payments Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <History className="text-indigo-600" size={24} />
                Recent Payments
              </h3>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <ListIcon size={18} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Loading ledger records...</p>
              </div>
            ) : (
              <>
                {viewMode === 'list' ? (
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 uppercase text-[10px] font-black text-slate-400 tracking-widest bg-slate-50/50 dark:bg-slate-900">
                          <th className="px-6 py-4">Payer Details</th>
                          <th className="px-6 py-4">Payment Info</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(p => (
                          <tr key={p._id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition group">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 transition">
                                  <AlertCircle size={20} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {p.user?.name || p.guestName || 'Anonymous'}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {p.user?.email || p.guestEmail || p.userEmail || 'No email provided'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                                  {p.title || (p.optionId?.title)}
                                </span>
                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                  ₦{p.amount?.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                                  <Clock size={10} /> {new Date(p.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex justify-center">
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border dark:border-transparent ${getStatusColor(p.status)}`}>
                                  {getStatusIcon(p.status)}
                                  {p.status?.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              {p.status === 'coordinator_marked_paid' ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => approve(p._id, 'approved')}
                                    className="p-2 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-xl transition border border-emerald-100 dark:border-emerald-900/30 dark:bg-emerald-900/20"
                                    title="Approve"
                                  >
                                    <CheckCircle2 size={18} />
                                  </button>
                                  <button
                                    onClick={() => approve(p._id, 'decline')}
                                    className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl transition border border-rose-100 dark:border-rose-900/30 dark:bg-rose-900/20"
                                    title="Decline"
                                  >
                                    <XCircle size={18} />
                                  </button>
                                </div>
                              ) : (
                                <button className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-slate-100 transition">
                                  <MoreVertical size={18} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {payments.map(p => (
                      <div key={p._id} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 transition shadow-sm hover:shadow-md bg-white dark:bg-slate-900/50 group">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-2 rounded-2xl ${getStatusColor(p.status)}`}>
                            {getStatusIcon(p.status)}
                          </div>
                          <span className="text-xl font-black text-slate-900 dark:text-white">₦{p.amount?.toLocaleString()}</span>
                        </div>

                        <div className="mb-4">
                          <div className="text-xs uppercase font-black text-slate-400 leading-none mb-1">Payer</div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">{p.user?.name || p.guestName || 'Anonymous'}</div>
                          <div className="text-xs text-slate-500 truncate">{p.user?.email || p.guestEmail || p.userEmail}</div>
                        </div>

                        <div className="mb-4">
                          <div className="text-xs uppercase font-black text-slate-400 leading-none mb-1">Purpose</div>
                          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{p.title || p.optionId?.title}</div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-bold">{new Date(p.createdAt).toLocaleString()}</span>
                          {p.status === 'coordinator_marked_paid' && (
                            <div className="flex gap-2">
                              <button onClick={() => approve(p._id, 'approved')} className="text-emerald-600 hover:text-white hover:bg-emerald-500 p-1.5 rounded-lg border border-emerald-200 transition">
                                <CheckCircle2 size={16} />
                              </button>
                              <button onClick={() => approve(p._id, 'decline')} className="text-rose-600 hover:text-white hover:bg-rose-500 p-1.5 rounded-lg border border-rose-200 transition">
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {payments.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                      <CircleDollarSign size={40} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">The vault is quiet</h4>
                    <p className="text-slate-500 max-w-xs">No payment records match your current criteria. Everything seems to be in order.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
