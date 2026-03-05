import { env } from "process";

const AGRO_API_URL = "http://api.agromonitoring.com/agro/1.0";

export async function createPolygonOnAgroMonitoring(name: string, geoJson: any) {
    const apiKey = process.env.AGROMONITORING_API_KEY;

    if (!apiKey) {
        console.warn("AgroMonitoring API Key is missing. Using Mock Polygon ID.");
        return { id: "DEMO_POLY_ID_" + Math.random().toString(36).substring(7) };
    }

    // AgroMonitoring API expects a Feature or Polygon.
    // If it's a FeatureCollection, take the first feature.
    let geo_json = geoJson;
    if (geo_json.type === "FeatureCollection" && geo_json.features.length > 0) {
        geo_json = geo_json.features[0];
    }

    // Ensure it's a Feature
    if (geo_json.type !== "Feature") {
        geo_json = {
            type: "Feature",
            properties: {},
            geometry: geo_json
        };
    }

    const response = await fetch(`${AGRO_API_URL}/polygons?appid=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: name,
            geo_json: geo_json,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("AgroMonitoring API Error:", errorText);
        throw new Error(`Failed to create polygon: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Returns the full polygon object including its 'id'
}

export async function getHistoricalNDVI(polygonId: string, startDate: Date, endDate: Date) {
    const apiKey = process.env.AGROMONITORING_API_KEY;
    if (!apiKey || polygonId.startsWith("DEMO_POLY_ID")) {
        // Return mock data for demo polygons or missing API keys to ensure UI is not empty
        return [
            { dt: Math.floor(Date.now() / 1000) - 86400 * 30 * 5, data: { mean: 0.45, min: 0.40, max: 0.50, p25: 0.42, p75: 0.48, stdev: 0.05 } },
            { dt: Math.floor(Date.now() / 1000) - 86400 * 30 * 4, data: { mean: 0.52, min: 0.48, max: 0.56, p25: 0.50, p75: 0.54, stdev: 0.04 } },
            { dt: Math.floor(Date.now() / 1000) - 86400 * 30 * 3, data: { mean: 0.68, min: 0.62, max: 0.74, p25: 0.65, p75: 0.71, stdev: 0.06 } },
            { dt: Math.floor(Date.now() / 1000) - 86400 * 30 * 2, data: { mean: 0.72, min: 0.68, max: 0.76, p25: 0.70, p75: 0.74, stdev: 0.04 } },
            { dt: Math.floor(Date.now() / 1000) - 86400 * 30 * 1, data: { mean: 0.65, min: 0.60, max: 0.70, p25: 0.62, p75: 0.68, stdev: 0.05 } },
            { dt: Math.floor(Date.now() / 1000), data: { mean: 0.71, min: 0.66, max: 0.76, p25: 0.68, p75: 0.74, stdev: 0.05 } }
        ];
    }

    const start = Math.floor(startDate.getTime() / 1000);
    const end = Math.floor(endDate.getTime() / 1000);

    const url = `${AGRO_API_URL}/ndvi/history?polyid=${polygonId}&start=${start}&end=${end}&appid=${apiKey}`;

    const response = await fetch(url, {
        next: { revalidate: 3600 }
    });

    if (!response.ok) {
        console.warn(`AgroMonitoring NDVI Fetch Error: ${response.statusText}`);
        return null;
    }

    const data = await response.json();
    return data;
}

export async function getCurrentWeather(polygonId: string) {
    const apiKey = process.env.AGROMONITORING_API_KEY;
    if (!apiKey || polygonId.startsWith("DEMO_POLY_ID")) {
        return {
            main: { temp: 298.15, humidity: 45 },
            weather: [{ id: 800, main: "Clear", description: "ciel dégagé", icon: "01d" }],
            wind: { speed: 4.2 },
            dt: Math.floor(Date.now() / 1000)
        };
    }

    const url = `${AGRO_API_URL}/weather?polyid=${polygonId}&appid=${apiKey}`;
    const response = await fetch(url, { next: { revalidate: 1800 } });

    if (!response.ok) return null;
    return await response.json();
}

export async function getWeatherForecast(polygonId: string) {
    const apiKey = process.env.AGROMONITORING_API_KEY;
    if (!apiKey || polygonId.startsWith("DEMO_POLY_ID")) {
        return {
            list: Array.from({ length: 40 }, (_, i) => ({
                dt: Math.floor(Date.now() / 1000) + i * 3600 * 3,
                main: { temp: 295.15 + Math.random() * 5 },
                weather: [{ id: 800, main: "Clear", description: "ensoleillé", icon: "01d" }]
            }))
        };
    }

    const url = `${AGRO_API_URL}/weather/forecast?polyid=${polygonId}&appid=${apiKey}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) return null;
    return await response.json();
}

export async function getSoilData(polygonId: string) {
    const apiKey = process.env.AGROMONITORING_API_KEY;

    if (!apiKey || polygonId.startsWith("DEMO_POLY_ID")) {
        return {
            t0: 295.15,
            moisture: 0.22,
            t10: 293.15,
            dt: Math.floor(Date.now() / 1000)
        };
    }

    const url = `${AGRO_API_URL}/soil?polyid=${polygonId}&appid=${apiKey}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) return null;
    return await response.json();
}
