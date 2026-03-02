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
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6 pb-12">
            {/* Minimalist Top Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60 pl-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">ESPACE PRODUCTEUR — EXPLOITANT AGRICOLE</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[1px]">{profile?.farmName || "Mon Domaine"}</span>
                    <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded uppercase">CERTIFIÉ</span>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-border shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-3 text-emerald-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">NEGOTIATION PROTOCOL</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Demandes de Connexion</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-2xl leading-relaxed">Gérez les demandes de mise en relation pour vos futurs contrats. <strong className="text-slate-700">{requests.length} nouvelles entreprises</strong> souhaitent entamer des discussions commerciales avec vous.</p>
            </div>

            <FarmerRequestsClient initialRequests={requests} />
        </main>
    );
}
