"use server";

import {
    getHistoricalIndex,
    getCurrentWeather,
    getWeatherForecast,
    getSoilData,
    createPolygonOnAgroMonitoring,
    getAccumulatedData,
    getUVIData,
    searchSatelliteImages
} from "@/services/agromonitoring.service";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";

/**
 * Server Action to fetch specific Index History (NDVI, EVI, NDWI, etc.)
 */
export async function getHistoricalIndexAction(polygonId: string, index: string = "ndvi") {
    if (!polygonId || polygonId === "WAITING_API_SYNC") {
        return { data: [], error: "No valid polygon ID provided" };
    }

    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        const data = await getHistoricalIndex(index, polygonId, startDate, endDate);
        return { data, error: null };
    } catch (error: any) {
        console.error(`Failed to fetch ${index} history in action:`, error);
        return { data: [], error: `Failed to fetch ${index} data` };
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
            getHistoricalIndex("ndvi", polygonId, startDate, endDate),
            getCurrentWeather(polygonId),
            getWeatherForecast(polygonId),
            getSoilData(polygonId),
            getAccumulatedData("temp", polygonId, startDate, endDate),
            getAccumulatedData("prec", polygonId, startDate, endDate),
            getUVIData(polygonId)
        ]);

        const timeoutPromise = new Promise(resolve =>
            setTimeout(() => resolve("TIMEOUT"), 8000) // Increased timeout for more data
        );

        const result = await Promise.race([dataPromise, timeoutPromise]);

        if (result === "TIMEOUT") {
            return { data: null, error: "TIMEOUT", isTimeout: true };
        }

        const [ndvi, weather, forecast, soil, accTemp, accPrec, uvi] = result as any;

        return {
            data: {
                ndvi,
                weather,
                forecast: forecast?.list ? forecast.list.filter((_: any, i: number) => i % 8 === 0) : [],
                soil,
                accumulated: {
                    temp: accTemp?.data,
                    prec: accPrec?.data
                },
                uvi: uvi?.uvi
            },
            error: null
        };
    } catch (error) {
        console.error("getFarmerAnalyticsAction error:", error);
        return { data: null, error: "Erreur lors de la récupération des données" };
    }
}

export async function getSatelliteImageryAction(polygonId: string) {
    if (!polygonId || polygonId === "WAITING_API_SYNC") return { data: [], error: "INVALID_ID" };

    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1); // Last month for imagery

        const scenes = await searchSatelliteImages(polygonId, startDate, endDate);
        return { data: scenes, error: null };
    } catch (error) {
        console.error("getSatelliteImageryAction error:", error);
        return { data: [], error: "Erreur imagerie satellite" };
    }
}

export async function syncParcelWithAgroMonitoringAction(parcelId: string) {
    if (!parcelId) return { error: "ID de parcelle manquant" };

    try {
        const parcel = await farmerRepository.getParcelById(parcelId);
        if (!parcel) return { error: "Parcelle introuvable" };
        if (parcel.polygonId !== "WAITING_API_SYNC") return { data: parcel.polygonId };

        const areaHectares = Number(parcel.area);
        if (areaHectares < 1.0) {
            return { data: "DEMO_POLY_ID_SMALL_PARCEL", error: null };
        }

        const apiResponse = await createPolygonOnAgroMonitoring(
            `Farm_${parcel.farmerId.substring(0, 8)}`,
            parcel.geoJson
        );

        if (apiResponse && apiResponse.id) {
            await farmerRepository.updateParcel(parcelId, {
                polygonId: apiResponse.id
            });
            return { data: apiResponse.id, error: null };
        }

        return { error: "L'API n'a pas renvoyé d'identifiant" };
    } catch (error: any) {
        console.error("Lazy Sync Failed:", error.message);
        return { error: `Échec de la synchronisation : ${error.message}` };
    }
}
