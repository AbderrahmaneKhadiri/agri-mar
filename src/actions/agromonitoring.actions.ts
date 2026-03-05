"use server";

import { getHistoricalNDVI, getCurrentWeather, getWeatherForecast, getSoilData, createPolygonOnAgroMonitoring } from "@/services/agromonitoring.service";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";

/**
 * Server Action to fetch NDVI History safely from client components
 * It fetches the last 6 months of NDVI data for a given polygon
 */
export async function getHistoricalNDVIAction(polygonId: string) {
    if (!polygonId || polygonId === "WAITING_API_SYNC") {
        return { data: [], error: "No valid polygon ID provided" };
    }

    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        const data = await getHistoricalNDVI(polygonId, startDate, endDate);
        return { data, error: null };
    } catch (error: any) {
        console.error("Failed to fetch historical NDVI in action:", error);
        return { data: [], error: "Failed to fetch satellite data" };
    }
}

export async function getFarmerAnalyticsAction(polygonId: string) {
    if (!polygonId || polygonId === "WAITING_API_SYNC") {
        return { data: null, error: "INVALID_ID" };
    }

    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        const dataPromise = Promise.all([
            getHistoricalNDVI(polygonId, startDate, endDate),
            getCurrentWeather(polygonId),
            getWeatherForecast(polygonId),
            getSoilData(polygonId)
        ]);

        const timeoutPromise = new Promise(resolve =>
            setTimeout(() => resolve("TIMEOUT"), 5000)
        );

        const result = await Promise.race([dataPromise, timeoutPromise]);

        if (result === "TIMEOUT") {
            return { data: null, error: "TIMEOUT", isTimeout: true };
        }

        const [ndvi, weather, forecast, soil] = result as any;

        return {
            data: {
                ndvi,
                weather,
                forecast: forecast?.list ? forecast.list.filter((_: any, i: number) => i % 8 === 0) : [],
                soil
            },
            error: null
        };
    } catch (error) {
        console.error("getFarmerAnalyticsAction error:", error);
        return { data: null, error: "Erreur lors de la récupération des données" };
    }
}

export async function syncParcelWithAgroMonitoringAction(parcelId: string) {
    if (!parcelId) return { error: "ID de parcelle manquant" };

    try {
        const parcel = await farmerRepository.getParcelById(parcelId);
        if (!parcel) return { error: "Parcelle introuvable" };
        if (parcel.polygonId !== "WAITING_API_SYNC") return { data: parcel.polygonId };

        // --- AgroMonitoring Constraint: Minimum 1.0 ha ---
        const areaHectares = Number(parcel.area);
        if (areaHectares < 1.0) {
            console.log(`Parcel ${parcelId} too small for AgroMonitoring (Area: ${areaHectares}ha). Falling back to simulation.`);
            return { data: "DEMO_POLY_ID_SMALL_PARCEL", error: null };
        }

        console.log(`Attempting Lazy Sync for Parcel: ${parcelId} (${areaHectares}ha)`);
        const apiResponse = await createPolygonOnAgroMonitoring(
            `Farm_Repair_${parcel.farmerId.substring(0, 8)}`,
            parcel.geoJson
        );

        if (apiResponse && apiResponse.id) {
            await farmerRepository.updateParcel(parcelId, {
                polygonId: apiResponse.id
            });
            console.log(`Lazy Sync Success: ${apiResponse.id}`);
            return { data: apiResponse.id, error: null };
        }

        return { error: "L'API n'a pas renvoyé d'identifiant" };
    } catch (error: any) {
        console.error("Lazy Sync Failed:", error.message);
        return { error: `Échec de la synchronisation : ${error.message}` };
    }
}
