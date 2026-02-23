import { getFarmersList } from "@/data-access/farmers.dal";
import { FarmerMarketClient } from "@/app/(dashboard)/dashboard/company/market/farmer-market-client";

export default async function MarketplacePage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const filters = await searchParams;

    // 1. Fetch initial farmers (Data Access Layer)
    const initialFarmers = await getFarmersList({
        search: typeof filters.search === 'string' ? filters.search : undefined,
        region: typeof filters.region === 'string' ? filters.region : undefined,
        cropType: typeof filters.cropType === 'string' ? filters.cropType : undefined,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Marché Agricole</h1>
                <p className="text-slate-500">Découvrez et connectez-vous avec les meilleurs agriculteurs du Maroc.</p>
            </div>

            {/* Content area - The interactive client component */}
            <FarmerMarketClient initialFarmers={initialFarmers} />
        </div>
    );
}
