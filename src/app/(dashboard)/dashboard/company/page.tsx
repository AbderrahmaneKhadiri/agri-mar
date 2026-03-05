import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/persistence/repositories/company.repository";
import { ChevronDown } from "lucide-react";

import { getAcceptedPartners, getOutgoingRequests } from "@/data-access/connections.dal";
import { getMarketplaceProducts, getMarketChartData } from "@/data-access/products.dal";
import { getCompanyTenders } from "@/data-access/tenders.dal";
import { getFarmersList } from "@/data-access/farmers.dal";
import { getHistoricalNDVIAction } from "@/actions/agromonitoring.actions";
import { CompanyDashboardTabs } from "@/components/dashboard/company/company-dashboard-tabs";
import { CompanyOverview } from "@/components/dashboard/company/company-overview";
import { calculateCompanyScore } from "@/lib/utils/profile-score";
import { ConfidenceScoreCard } from "@/components/dashboard/confidence-score-card";
import { cn } from "@/lib/utils";

export default async function CompanyDashboardPage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const { tab } = await searchParams;
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const profile = await companyRepository.findByUserId(session.user.id);
    if (!profile) redirect("/onboarding/company");

    const [suppliers, marketOffers, requests, marketChartData, tenders, allFarmers] = await Promise.all([
        getAcceptedPartners(profile.id, "COMPANY"),
        getMarketplaceProducts(),
        getOutgoingRequests(profile.id, "COMPANY"),
        getMarketChartData(),
        getCompanyTenders(profile.id),
        getFarmersList()
    ]);

    // Monitored area from accepted suppliers
    let totalMonitoredArea = 0;
    suppliers.forEach(supplier => {
        const fullProfile = allFarmers.find(f => f.id === supplier.id);
        if (fullProfile?.totalAreaHectares) {
            totalMonitoredArea += parseFloat(fullProfile.totalAreaHectares);
        }
    });

    // Average NDVI across supplier parcels
    let totalNdvi = 0;
    let monitoredParcelsCount = 0;
    await Promise.all(
        suppliers.map(async (supplier) => {
            if (supplier.parcelPolygonId) {
                try {
                    const result = await getHistoricalNDVIAction(supplier.parcelPolygonId);
                    if (result.data && result.data.length > 0) {
                        totalNdvi += result.data[result.data.length - 1].data.mean;
                        monitoredParcelsCount++;
                    }
                } catch { /* silent */ }
            }
        })
    );
    const averageNdvi = monitoredParcelsCount > 0 ? (totalNdvi / monitoredParcelsCount).toFixed(2) : "--";

    return (
        <main className="flex flex-1 flex-col gap-5 p-4 lg:p-6">
            {/* Top bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2c5f42]" />
                    <span className="uppercase tracking-[2px] font-medium">Espace Acheteur</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                        <span>Dashboard</span>
                        <ChevronDown className="size-3" />
                        <span className="text-slate-700 font-medium">
                            {!tab ? "Vue d'ensemble" :
                                tab === "market" ? "Place de Marché" :
                                    tab === "network" ? "Mon Réseau & Monitoring" :
                                        tab === "tenders" ? "Appels d'Offres" :
                                            tab === "requests" ? "Demandes Reçues" :
                                                tab === "profile" ? "Mon Espace Business" : "Vue d'ensemble"}
                        </span>
                    </div>
                    <span className={cn(
                        "text-[9px] font-medium px-2 py-0.5 rounded-md uppercase tracking-wide",
                        calculateCompanyScore(profile) >= 80
                            ? "bg-[#e8f4ed] text-[#2c5f42] border border-[#c4dece]"
                            : "bg-slate-100 text-slate-400 border border-border"
                    )}>
                        {calculateCompanyScore(profile) >= 80 ? "Vérifié" : "Profil Business"}
                    </span>
                </div>
            </div>

            {/* Overview — only when no tab selected */}
            {!tab && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-5">
                    <CompanyOverview
                        suppliers={suppliers}
                        totalOffers={marketOffers.length}
                        totalTenders={tenders.length}
                        averageNdvi={averageNdvi}
                        totalMonitoredArea={totalMonitoredArea}
                        marketChartData={marketChartData}
                        companyName={profile.companyName}
                    />
                    <ConfidenceScoreCard
                        score={calculateCompanyScore(profile)}
                        role="COMPANY"
                    />
                </div>
            )}

            {/* Tab content */}
            <div className={cn("transition-all duration-500", !tab ? "hidden" : "opacity-100")}>
                <CompanyDashboardTabs
                    companyProfile={profile}
                    initialSuppliers={suppliers}
                    initialMarketOffers={marketOffers as any}
                    initialRequests={requests}
                    initialTenders={tenders as any}
                    initialFarmers={allFarmers}
                    userImage={session.user.image}
                />
            </div>
        </main>
    );
}
