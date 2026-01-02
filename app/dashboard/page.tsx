import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/constants";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    const role = (session?.user as any)?.role;

    if (role === UserRole.ADMIN) {
        redirect("/dashboard/admin");
    } else if (role === UserRole.COORDINATOR) {
        redirect("/dashboard/coordinator");
    } else {
        redirect("/dashboard/member");
    }
}
