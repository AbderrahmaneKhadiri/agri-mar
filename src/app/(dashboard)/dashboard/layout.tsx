import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { companyRepository } from "@/persistence/repositories/company.repository";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        return redirect("/login");
    }

    let profileName: string | undefined;

    if (session.user.role === "FARMER") {
        const profile = await farmerRepository.findByUserId(session.user.id);
        profileName = profile?.fullName;
    } else if (session.user.role === "COMPANY") {
        const profile = await companyRepository.findByUserId(session.user.id);
        profileName = profile?.companyName;
    }

    return (
        <SidebarProvider>
            <AppSidebar
                profileName={profileName}
                role={session.user.role}
                userEmail={session.user.email}
                userAvatar={session.user.image}
            />
            <SidebarInset>
                <SiteHeader userId={session.user.id} />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="mx-auto w-full max-w-[1400px]">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
