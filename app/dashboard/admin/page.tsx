export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-2xl font-bold mt-2">1,234</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Coordinators</h3>
                    <p className="text-2xl font-bold mt-2 text-amber-500">5</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                    <p className="text-2xl font-bold mt-2 text-indigo-600">$12,450</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-gray-500 text-sm font-medium">Active Tickets</h3>
                    <p className="text-2xl font-bold mt-2">18</p>
                </div>
            </div>

            {/* Fragments for Admin would go here */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-semibold mb-4 text-indigo-700">Recent Activity</h2>
                <p className="text-gray-400">Everything at a glance for the Admin.</p>
            </div>
        </div>
    );
}
