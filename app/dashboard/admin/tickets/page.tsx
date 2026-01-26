import TicketsFragment from "@/app/components/coordinator/fragments/TicketsFragment";

export default function AdminTicketsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-1xl font-bold text-slate-900 dark:text-white">Admin Support Oversight</h1>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                {/* Reusing CoordinatorFragment as it contains all needed logic for Admin too */}
                <TicketsFragment />
            </div>
        </div>
    );
}
