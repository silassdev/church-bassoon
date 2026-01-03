export default function CoordinatorDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-1xl font-bold">Coordinator Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-gray-500 text-sm font-medium">My Open Tickets</h3>
                    <p className="text-2xl font-bold mt-2 text-emerald-600">3</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-gray-500 text-sm font-medium">Handled Tickets</h3>
                    <p className="text-2xl font-bold mt-2">45</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-gray-500 text-sm font-medium">Assigned Events</h3>
                    <p className="text-2xl font-bold mt-2 text-indigo-600">2</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 border-l-4 border-l-emerald-500">
                <h2 className="text-xl font-semibold mb-4 text-emerald-700">Support Queue</h2>
                <p className="text-gray-400">Manage your assigned support requests here.</p>
            </div>
        </div>
    );
}
