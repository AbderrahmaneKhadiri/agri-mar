import { cache } from "react";
import { db } from "@/persistence/db";
import { farmerProfiles, parcels, harvestPlans } from "@/persistence/schema";
import { eq } from "drizzle-orm";
import {
    getHistoricalNDVI,
    getSoilData,
    getCurrentWeather,
    getWeatherForecast
} from "@/services/agromonitoring.service";

export type FarmerAICheckRecord = {
    profile: any;
    parcels: any[];
    plans: any[];
};

export const getFarmerAIContext = cache(async (userId: string) => {
    // 1. Get Farmer Profile
    const profile = await db.query.farmerProfiles.findFirst({
        where: eq(farmerProfiles.userId, userId),
    });

    if (!profile) return null;

    // 2. Get Parcels
    const farmerParcels = await db.query.parcels.findMany({
        where: eq(parcels.farmerId, profile.id),
    });

    // 3. Get Harvest Plans
    const plans = await db.query.harvestPlans.findMany({
        where: eq(harvestPlans.farmerId, profile.id),
    });

    // 4. Enrich Parcels with real-time AgroMonitoring data
    const enrichedParcels = await Promise.all(
        farmerParcels.map(async (parcel) => {
            try {
                const [ndviHistory, soil, weather, forecast] = await Promise.all([
                    getHistoricalNDVI(parcel.polygonId, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
                    getSoilData(parcel.polygonId),
                    getCurrentWeather(parcel.polygonId),
                    getWeatherForecast(parcel.polygonId),
                ]);

                return {
                    ...parcel,
                    realTimeData: {
                        currentNDVI: ndviHistory?.[ndviHistory.length - 1]?.data?.mean || "Indisponible",
                        soilMoisture: soil?.moisture || "Indisponible",
                        soilTemp: soil?.t0 ? (soil.t0 - 273.15).toFixed(1) : "Indisponible", // Kelvin to Celsius
                        currentWeather: weather?.weather?.[0]?.description || "Indisponible",
                        temperature: weather?.main?.temp ? (weather.main.temp - 273.15).toFixed(1) : "Indisponible",
                        forecast: forecast?.list?.slice(0, 8).map((f: any) => ({
                            dt: f.dt,
                            temp: (f.main.temp - 273.15).toFixed(1),
                            desc: f.weather?.[0]?.description
                        }))
                    }
                };
            } catch (error) {
                console.error(`Error fetching data for parcel ${parcel.name}:`, error);
                return { ...parcel, realTimeData: null };
            }
        })
    );

    return {
        profile,
        parcels: enrichedParcels,
        plans,
    };
});
