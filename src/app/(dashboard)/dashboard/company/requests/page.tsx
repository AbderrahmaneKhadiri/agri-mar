import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { companyRepository } from "@/persistence/repositories/company.repository";
import { getOutgoingRequests } from "@/data-access/connections.dal";
import { CompanyRequestsClient } from "./company-requests-client";
import { ChevronDown, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function RequestsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) return null;

    const company = await companyRepository.findByUserId(session.user.id);
    if (!company) return null;

    const requests = await getOutgoingRequests(company.id, "COMPANY");

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 lg:gap-6">
            {/* Minimalist Top Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100/60 pl-2">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">ESPACE ACHETEUR — CENTRE DE COMMANDE</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[1px]">{company.companyName}</span>
                    <span className="bg-blue-50 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded uppercase">ENTREPRISE</span>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-[4px_12px_40px_-12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-3 text-blue-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">SUIVI DES NÉGOCIATIONS</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Suivi des Demandes</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-3xl leading-relaxed">
                    Gérez vos propositions de contrats et suivez l&apos;état des négociations avec vos partenaires agriculteurs. Chaque demande est une opportunité de <strong className="text-slate-700 font-bold underline decoration-blue-200/50">sécuriser vos approvisionnements</strong> de manière durable.
                </p>
            </div>
            {/* Header contextuel */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                    <span>Demandes</span>
                    <ChevronDown className="size-3" />
                    <span className="text-slate-900 font-semibold">Mes Demandes</span>
                </div>
                <div className="flex items-center gap-2">
                </div>
            </div>

            <CompanyRequestsClient initialRequests={requests} />
        </main>
    );
}
