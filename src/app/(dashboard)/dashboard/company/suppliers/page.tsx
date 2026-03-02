import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { companyRepository } from "@/persistence/repositories/company.repository";
import { getAcceptedPartners } from "@/data-access/connections.dal";
import { CompanySuppliersClient } from "./company-suppliers-client";
import { ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SuppliersPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const profile = await companyRepository.findByUserId(session.user.id);
    if (!profile) return <div>Profil non trouvé</div>;

    const partners = await getAcceptedPartners(profile.id, "COMPANY");

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6">
            {/* Minimalist Top Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60 pl-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">ESPACE ACHETEUR — CENTRE DE COMMANDE</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[1px]">{profile.companyName}</span>
                    <span className="bg-blue-50 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded uppercase">ENTREPRISE</span>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-border shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-3 text-blue-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">VOTRE RÉSEAU</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Mes Partenaires</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-3xl leading-relaxed">
                    Retrouvez l&apos;ensemble de vos <strong className="text-slate-700 font-bold underline decoration-blue-200/50">fournisseurs certifiés</strong> et accédez à leurs catalogues de produits. Maintenir des relations solides est la clé pour une <strong className="text-slate-700 font-bold underline decoration-blue-200/50">chaîne logistique </strong> stable et transparente.
                </p>
            </div>
            {/* Header contextuel */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                    <span>Partenaires</span>
                    <ChevronDown className="size-3" />
                    <span className="text-slate-900 font-semibold">Mes Fournisseurs</span>
                </div>
            </div>

            <CompanySuppliersClient initialPartners={partners} />
        </main>
    );
}
