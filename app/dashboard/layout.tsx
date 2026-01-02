import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminSidebar from "@/app/components/sidebars/AdminSidebar";
import CoordinatorSidebar from "@/app/components/sidebars/CoordinatorSidebar";
import MemberSidebar from "@/app/components/sidebars/MemberSidebar";
import DashboardShell from "@/app/components/DashboardShell";

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
        <DashboardShell sidebar={renderSidebar()}>
            {children}
        </DashboardShell>
    );
}
