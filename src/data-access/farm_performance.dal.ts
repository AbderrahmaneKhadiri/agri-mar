import { cache } from "react";
import { db } from "@/persistence/db";
import { farmerProfiles, parcels } from "@/persistence/schema";
import { eq } from "drizzle-orm";
import { getHistoricalNDVI } from "@/services/agromonitoring.service";

/**
 * Fetches comparative NDVI data for the current year and the previous year
 * Returns a score and two series of data points
 */
export const getFarmPerformanceHistory = cache(async (userId: string) => {
    // 1. Get Farmer Profile
    const profile = await db.query.farmerProfiles.findFirst({
        where: eq(farmerProfiles.userId, userId),
    });

    if (!profile) return null;

    // 2. Get Parcels
    const farmerParcels = await db.query.parcels.findMany({
        where: eq(parcels.farmerId, profile.id),
    });

    if (farmerParcels.length === 0) return null;

    // We take the first parcel as a proxy for the general farm trend, 
    // or we could aggregate, but for Agro-Monitoring quotas, let's stick to the main one or a few.
    const mainParcel = farmerParcels[0];

    // GUARD: If the parcel is not yet synced, return null (it will be handled as "Simulated" in the UI)
    if (!mainParcel.polygonId || mainParcel.polygonId === "WAITING_API_SYNC") {
        return null;
    }

    const today = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);

    // Range for Current Year (last 12 months)
    const currentYearStart = new Date();
    currentYearStart.setFullYear(today.getFullYear() - 1);

    // Range for Previous Year (12 to 24 months ago)
    const previousYearStart = new Date();
    previousYearStart.setFullYear(today.getFullYear() - 2);
    const previousYearEnd = new Date();
    previousYearEnd.setFullYear(today.getFullYear() - 1);

    try {
        const [currentData, previousData] = await Promise.all([
            getHistoricalNDVI(mainParcel.polygonId, currentYearStart, today),
            getHistoricalNDVI(mainParcel.polygonId, previousYearStart, previousYearEnd)
        ]);

        // Calculate a simple performance score (0-100)
        // Based on NDVI average vs a healthy baseline (0.7)
        const currentAvg = currentData.length > 0
            ? currentData.reduce((acc: number, curr: any) => acc + (curr.data?.mean || 0), 0) / currentData.length
            : 0;

        const previousAvg = previousData.length > 0
            ? previousData.reduce((acc: number, curr: any) => acc + (curr.data?.mean || 0), 0) / previousData.length
            : 0;

        // Stability factor: how much it improved or stayed stable
        const growth = previousAvg > 0 ? (currentAvg / previousAvg) : 1;
        const score = Math.min(100, Math.round(currentAvg * 100 * Math.max(0.8, Math.min(1.2, growth))));

        return {
            parcelName: mainParcel.name,
            score,
            currentYear: currentData.map((d: any) => ({
                date: new Date(d.dt * 1000).toLocaleDateString('fr-FR', { month: 'short' }),
                ndvi: d.data?.mean || 0
            })),
            previousYear: previousData.map((d: any) => ({
                date: new Date(d.dt * 1000).toLocaleDateString('fr-FR', { month: 'short' }),
                ndvi: d.data?.mean || 0
            })),
            stats: {
                currentAvg: currentAvg.toFixed(2),
                previousAvg: previousAvg.toFixed(2),
                delta: (((currentAvg - previousAvg) / (previousAvg || 1)) * 100).toFixed(1)
            }
        };
    } catch (error) {
        console.error("Error fetching historical performance:", error);
        return null;
    }
});
