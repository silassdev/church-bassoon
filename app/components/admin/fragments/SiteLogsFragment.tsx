'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Shield,
  DollarSign,
  UserPlus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

type LogItem = {
  _id: string;
  type: string;
  message: string;
  ip?: string;
  meta?: any;
  createdAt: string
};

const LOG_TYPE_CONFIG = {
  view: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Eye, label: 'View' },
  blocked: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: Shield, label: 'Blocked' },
  payment_success: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckCircle2, label: 'Payment Success' },
  payment_failed: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: XCircle, label: 'Payment Failed' },
  signup: { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: UserPlus, label: 'Sign Up' },
  deletion: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', icon: Trash2, label: 'Deletion' },
  info: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', icon: Activity, label: 'Info' },
  error: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: AlertTriangle, label: 'Error' },
};

export default function SiteLogsFragment() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'day' | 'week' | 'year'>('day');
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<any>(null);

  async function loadLogs(p = 1) {
    setLoading(true);
    const res = await fetch(`/api/admin/logs?page=${p}&limit=20`);
    if (!res.ok) { setLogs([]); setLoading(false); return; }
    const j = await res.json();
    setLogs(j.items || []);
    setPage(j.page || 1);
    setTotalPages(j.totalPages || 1);
    setLoading(false);
  }

  async function loadStats() {
    const res = await fetch(`/api/admin/logs/stats?period=${period}`);
    if (!res.ok) return;
    const j = await res.json();
    const labels = j.data.map((d: any) => d.label);
    const counts = j.data.map((d: any) => d.count);

    // Ensure canvas exists
    if (!chartRef.current) return;

    // Ensure Chart.js is loaded
    if (typeof window === 'undefined') return;
    if (!(window as any).Chart) {
      try {
        await loadChartJs();
      } catch (err) {
        console.error('Failed to load Chart.js:', err);
        return;
      }
    }

    const Chart = (window as any).Chart;
    if (!Chart) return;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.labels = labels;
      chartInstanceRef.current.data.datasets[0].data = counts;
      chartInstanceRef.current.update();
      return;
    }
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Views',
          data: counts,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b' }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#64748b' }
          }
        },
      }
    });
  }

  function loadChartJs() {
    return new Promise<void>((resolve, reject) => {
      const id = 'chartjs-cdn';
      if (document.getElementById(id)) return resolve();
      const s = document.createElement('script');
      s.id = id;
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  useEffect(() => { loadLogs(1); }, []);
  useEffect(() => { loadStats(); }, [period]);

  function prev() { if (page > 1) loadLogs(page - 1); }
  function next() { if (page < totalPages) loadLogs(page + 1); }

  function getLogConfig(type: string) {
    return LOG_TYPE_CONFIG[type as keyof typeof LOG_TYPE_CONFIG] || LOG_TYPE_CONFIG.info;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-1xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-indigo-600" size={28} />
            Site Analytics & Logs
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track views, user activity, and system events</p>
        </div>
      </div>

      {/* Analytics Graph */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-sm font-bold uppercase text-slate-400 mb-4">Period</div>
          <div className="flex flex-col gap-2">
            {(['day', 'week', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${period === p
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold uppercase text-slate-400 mb-6">Views Over Time</h3>
          <div className="h-64">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Recent Activity Logs</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Last 20 events (older logs are archived)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Message</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400">IP</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Loading logs...
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No logs found</td>
                </tr>
              ) : (
                logs.map(l => {
                  const config = getLogConfig(l.type);
                  const Icon = config.icon;
                  return (
                    <tr key={l._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.color}`}>
                          <Icon size={14} />
                          <span className="text-xs font-bold">{config.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{l.message}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{l.ip || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(l.createdAt).toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of <span className="font-bold">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={next}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
