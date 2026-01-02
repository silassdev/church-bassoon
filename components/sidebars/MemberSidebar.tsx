export default function MemberSidebar() {
    return (
        <nav className="h-full bg-gradient-to-b from-slate-600 to-slate-700 text-white p-4">
            <div className="text-xl font-semibold mb-6">Member</div>
            <ul className="space-y-3">
                <li className="hover:bg-white/10 p-2 rounded cursor-pointer transition-colors">Dashboard</li>
                <li className="hover:bg-white/10 p-2 rounded cursor-pointer transition-colors">My Giving</li>
                <li className="hover:bg-white/10 p-2 rounded cursor-pointer transition-colors">Support</li>
            </ul>
        </nav>
    );
}
