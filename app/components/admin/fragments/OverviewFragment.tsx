export default function OverviewFragment() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Overview</h2>
      <p className="text-sm text-slate-600 mb-4">No section selected. Click an item in the sidebar to open its fragment.</p>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Users: TODO stats</div>
        <div className="p-4 bg-white rounded shadow">Finance: TODO stats</div>
        <div className="p-4 bg-white rounded shadow">Announcements: TODO</div>
      </div>
    </div>
  );
}
