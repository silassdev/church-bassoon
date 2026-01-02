export default function AdminSidebar() {
    return (
        <nav className="h-full bg-gradient-to-b from-indigo-600 to-indigo-700 text-white p-4">
            <div className="text-xl font-semibold mb-6">Admin</div>
            <ul className="space-y-3">
                <li className="hover:bg-white/10 p-2 rounded cursor-pointer transition-colors">Overview</li>
                <li className="hover:bg-white/10 p-2 rounded cursor-pointer transition-colors">Manage Users</li>
                <li className="hover:bg-white/10 p-2 rounded cursor-pointer transition-colors">Transactions</li>
                <li className="hover:bg-white/10 p-2 rounded cursor-pointer transition-colors">Approve Coordinators</li>
            </ul>
        </nav>
    );
}
