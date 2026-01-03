export default function MemberDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-1xl font-bold">Welcome, Member</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-semibold mb-2 text-slate-700">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <button className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
                            <p className="font-semibold">Make a Pledge</p>
                            <p className="text-xs text-gray-400">Support your church</p>
                        </button>
                        <button className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
                            <p className="font-semibold">Raise Ticket</p>
                            <p className="text-xs text-gray-400">Get assistance</p>
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-semibold mb-4 text-slate-700">My Contributions</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-50 dark:border-gray-800">
                            <span className="text-sm font-medium">Tithe - Jan 2026</span>
                            <span className="font-bold text-emerald-600">$200.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Building Fund</span>
                            <span className="font-bold text-emerald-600">$50.00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
