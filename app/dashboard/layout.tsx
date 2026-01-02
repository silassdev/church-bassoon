import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/sidebars/AdminSidebar";
import CoordinatorSidebar from "@/components/sidebars/CoordinatorSidebar";
import MemberSidebar from "@/components/sidebars/MemberSidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const role = (session?.user as any)?.role;

    const renderSidebar = () => {
        switch (role) {
            case "admin":
                return <AdminSidebar />;
            case "coordinator":
                return <CoordinatorSidebar />;
            default:
                return <MemberSidebar />;
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
                {renderSidebar()}
            </aside>
            <main className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-slate-950">
                {children}
            </main>
        </div>
    );
}
