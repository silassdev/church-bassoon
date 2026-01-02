export default function CoordinatorSidebar() {
    return (
        <nav className="h-full bg-gradient-to-b from-emerald-600 to-emerald-700 text-white p-4">
            <div className="text-xl font-semibold mb-6">Coordinator</div>
            <ul className="space-y-3">
                <li className="hover:bg-white/10 p-2 rounded cursor-pointer transition-colors">My Tickets</li>
                <li className="hover:bg-white/10 p-2 rounded cursor-pointer transition-colors">Member Directory</li>
                <li className="hover:bg-white/10 p-2 rounded cursor-pointer transition-colors">Create Event</li>
            </ul>
        </nav>
    );
}
