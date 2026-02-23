import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { getIncomingRequests } from "@/data-access/connections.dal";
import { FarmerRequestsClient } from "./farmer-requests-client";

export default async function RequestsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const profile = await farmerRepository.findByUserId(session.user.id);
    if (!profile) return <div>Profil non trouvé</div>;

    const requests = await getIncomingRequests(profile.id, "FARMER");

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mes Demandes</h1>
                <p className="text-slate-500 mt-2">Gérez les propositions de partenariat des entreprises.</p>
            </div>

            <FarmerRequestsClient initialRequests={requests} />
        </div>
    );
}
