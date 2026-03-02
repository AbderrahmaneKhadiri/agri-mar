import { getFarmersList } from "@/data-access/farmers.dal";
import { FarmerMarketClient } from "@/app/(dashboard)/dashboard/company/market/farmer-market-client";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/persistence/repositories/company.repository";
import { ChevronDown } from "lucide-react";

export default async function MarketplacePage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const filters = await searchParams;

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const profile = await companyRepository.findByUserId(session.user.id);
    if (!profile) return <div>Profil non trouvé</div>;

    // 1. Fetch initial farmers (Data Access Layer)
    const initialFarmers = await getFarmersList({
        search: typeof filters.search === 'string' ? filters.search : undefined,
        region: typeof filters.region === 'string' ? filters.region : undefined,
        cropType: typeof filters.cropType === 'string' ? filters.cropType : undefined,
    });

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
                    <span className="text-[10px] font-bold uppercase tracking-[2px]">SOURCING STRATÉGIQUE</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Marché Agricole</h1>
                <p className="text-slate-500 mt-2 font-medium max-w-3xl leading-relaxed">
                    Explorez le <strong className="text-slate-700 font-bold underline decoration-blue-200/50">marché agricole</strong> et découvrez les meilleures offres de nos producteurs certifiés. Trouvez vos futurs partenaires et sécurisez des produits de qualité supérieure en <strong className="text-slate-700 font-bold underline decoration-blue-200/50">circuit court</strong>.
                </p>
            </div>

            <FarmerMarketClient initialFarmers={initialFarmers} />
        </main>
    );
}
