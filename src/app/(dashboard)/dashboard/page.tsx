import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/connexion");
    }

    if (session.user.role === "FARMER") {
        redirect("/dashboard/farmer");
    } else if (session.user.role === "COMPANY") {
        redirect("/dashboard/company");
    }

    redirect("/");
}
