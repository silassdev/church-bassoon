import TicketsFragment from "@/app/components/member/fragments/TicketsFragment";

export default function TicketsPrefPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-1xl font-bold text-slate-900 dark:text-white">Manage Tickets</h1>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <TicketsFragment />
            </div>
        </div>
    );
}