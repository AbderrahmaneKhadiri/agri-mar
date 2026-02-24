import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Session check on server-side for security (DAL)
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/connexion");
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar - Fixed on the left */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-[280px] p-8">
                {/* Content inner container */}
                <div className="max-w-[1400px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
