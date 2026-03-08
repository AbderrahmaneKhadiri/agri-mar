import { redirect } from "next/navigation";

export default async function RequestsPage() {
    redirect("/dashboard/farmer?tab=requests");
}
