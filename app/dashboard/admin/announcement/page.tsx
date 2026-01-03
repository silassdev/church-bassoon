import AnnouncementFragment from "@/app/components/admin/fragments/AnnouncementFragment";

export default function AdminFinancePage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-1xl font-bold text-slate-900 dark:text-white">Manage Announcement</h1>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <AnnouncementFragment />
            </div>
        </div>
    );
}