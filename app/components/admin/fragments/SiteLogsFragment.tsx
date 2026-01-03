'use client';
import { useEffect, useRef, useState } from 'react';

type LogItem = { _id: string; type: string; message: string; ip?: string; meta?: any; createdAt: string };

export default function SiteLogsFragment() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'day'|'week'|'year'>('day');
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
    const labels = j.data.map((d:any) => d.label);
    const counts = j.data.map((d:any) => d.count);

    // lazy-load Chart.js from CDN
    if (!chartRef.current) return;
    if (!window || !(window as any).Chart) {
      await loadChartJs();
    }
    const Chart = (window as any).Chart;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.labels = labels;
      chartInstanceRef.current.data.datasets[0].data = counts;
      chartInstanceRef.current.update();
      return;
    }
    const ctx = (chartRef.current as HTMLCanvasElement).getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Views',
          data: counts,
          fill: false,
          tension: 0.25,
        }]
      },
      options: {
        responsive: true,
        scales: { x: { display: true }, y: { beginAtZero: true } },
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

  useEffect(()=> { loadLogs(1); }, []);
  useEffect(()=> { loadStats(); }, [period]);

  function prev() { if (page > 1) loadLogs(page - 1); }
  function next() { if (page < totalPages) loadLogs(page + 1); }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Site & Logs</h2>

      <div className="mb-4 grid md:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-slate-500">Show stats for</div>
          <div className="mt-2 flex gap-2">
            <button onClick={()=>setPeriod('day')} className={`px-3 py-1 rounded ${period==='day'?'bg-indigo-600 text-white':'border'}`}>Day</button>
            <button onClick={()=>setPeriod('week')} className={`px-3 py-1 rounded ${period==='week'?'bg-indigo-600 text-white':'border'}`}>Week</button>
            <button onClick={()=>setPeriod('year')} className={`px-3 py-1 rounded ${period==='year'?'bg-indigo-600 text-white':'border'}`}>Year</button>
          </div>
        </div>

        <div className="col-span-2 bg-white p-4 rounded shadow">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Message</th>
              <th className="p-2 text-left">IP</th>
              <th className="p-2 text-left">Meta</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-4">Loading...</td></tr> :
              logs.map(l => (
                <tr key={l._id} className="border-t">
                  <td className="p-2 text-sm">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="p-2 text-sm">{l.type}</td>
                  <td className="p-2 text-sm">{l.message}</td>
                  <td className="p-2 text-sm">{l.ip || '-'}</td>
                  <td className="p-2 text-sm"><pre className="text-xs">{JSON.stringify(l.meta || {}, null, 0)}</pre></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm">Page {page} / {totalPages}</div>
        <div className="flex gap-2">
          <button onClick={prev} disabled={page<=1} className="px-3 py-1 border rounded">Prev</button>
          <button onClick={next} disabled={page>=totalPages} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  );
}
