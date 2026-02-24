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
        <FarmerMarketClient initialFarmers={initialFarmers} />
    );
}
