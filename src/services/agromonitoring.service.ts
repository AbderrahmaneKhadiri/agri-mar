import { env } from "process";

const AGRO_API_URL = "http://api.agromonitoring.com/agro/1.0";

export async function createPolygonOnAgroMonitoring(name: string, geoJson: any) {
    const apiKey = process.env.AGROMONITORING_API_KEY?.trim();

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

export async function getHistoricalIndex(index: string, polygonId: string, startDate: Date, endDate: Date) {
    const apiKey = process.env.AGROMONITORING_API_KEY?.trim();
    const indexLower = index.toLowerCase();

    // Mock data for demo or if no API key or if still syncing
    if (!apiKey || polygonId.startsWith("DEMO_POLY_ID") || polygonId === "WAITING_API_SYNC") {

        return generateMockHistory(indexLower);
    }

    const start = Math.floor(startDate.getTime() / 1000);
    const end = Math.floor(endDate.getTime() / 1000);
    const url = `${AGRO_API_URL}/${indexLower}/history?polyid=${polygonId}&start=${start}&end=${end}&appid=${apiKey}`;



    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    try {
        const response = await fetch(url, {
            next: { revalidate: 3600 },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const err = await response.text();
            console.error(`[AgroMonitoring] Error ${response.status} for ${indexLower}: ${err}`);

            if (response.status === 403 || response.status === 401 || response.status === 404) {
                return generateMockHistory(indexLower);
            }
            return [];
        }

        const result = await response.json();

        return result;
    } catch (error: any) {
        clearTimeout(timeoutId);
        console.error(`[AgroMonitoring] Fetch failed/timeout for ${indexLower}:`, error.message);
        return generateMockHistory(indexLower); // Fallback on any network/timeout error
    }
}

/**
 * Helper to generate smooth, realistic mock data for indices
 */
function generateMockHistory(index: string) {
    const indexLower = index.toLowerCase();
    const baseValue = indexLower === "ndvi" ? 0.6 : indexLower === "evi" ? 0.4 : indexLower === "ndwi" ? 0.2 : 0.5;
    const count = 30;
    return Array.from({ length: count }, (_, i) => {
        const timestamp = Math.floor(Date.now() / 1000) - 86400 * 6 * (count - 1 - i);
        const variation = Math.sin(i / 4) * 0.12 + (Math.random() * 0.04);
        return {
            dt: timestamp,
            data: {
                mean: Math.max(0, Math.min(1, baseValue + variation)),
                min: Math.max(0, baseValue + variation - 0.08),
                max: Math.min(1, baseValue + variation + 0.15),
            }
        };
    });
}

export async function getHistoricalNDVI(polygonId: string, startDate: Date, endDate: Date) {
    return getHistoricalIndex("ndvi", polygonId, startDate, endDate);
}

export async function getAccumulatedData(type: "temp" | "prec", polygonId: string, startDate: Date, endDate: Date) {
    const apiKey = process.env.AGROMONITORING_API_KEY?.trim();
    if (!apiKey || polygonId.startsWith("DEMO_POLY_ID") || polygonId === "WAITING_API_SYNC") {
        return {
            dt: Math.floor(Date.now() / 1000),
            data: type === "temp" ? 1250.5 : 450.2 // Mock totals
        };
    }

    const start = Math.floor(startDate.getTime() / 1000);
    const end = Math.floor(endDate.getTime() / 1000);
    const url = `${AGRO_API_URL}/${type}/accumulated?polyid=${polygonId}&start=${start}&end=${end}&appid=${apiKey}`;

    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) return null;
    return await response.json();
}

export async function getUVIData(polygonId: string) {
    const apiKey = process.env.AGROMONITORING_API_KEY?.trim();
    if (!apiKey || polygonId.startsWith("DEMO_POLY_ID") || polygonId === "WAITING_API_SYNC") {
        return { uvi: 4.5, dt: Math.floor(Date.now() / 1000) };
    }

    const url = `${AGRO_API_URL}/uvi?polyid=${polygonId}&appid=${apiKey}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    return await response.json();
}

export async function searchSatelliteImages(polygonId: string, startDate: Date, endDate: Date) {
    const apiKey = process.env.AGROMONITORING_API_KEY?.trim();
    if (!apiKey || polygonId.startsWith("DEMO_POLY_ID") || polygonId === "WAITING_API_SYNC") {
        return [{
            dt: Math.floor(Date.now() / 1000),
            type: "sentinel-2",
            cl: 2.5,
            image: {
                truecolor: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000",
                falsecolor: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000",
                ndvi: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000"
            },
            tile: { truecolor: "", falsecolor: "", ndvi: "" },
            stats: { ndvi: "https://api.agromonitoring.com/agro/1.0/stats/ndvi" }
        }];
    }

    const start = Math.floor(startDate.getTime() / 1000);
    const end = Math.floor(endDate.getTime() / 1000);
    const url = `${AGRO_API_URL}/image/search?polyid=${polygonId}&start=${start}&end=${end}&appid=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const scenes = await response.json();

    // Proxy the image URLs to hide API key and bypass 401 Unauthorized
    return scenes.map((scene: any) => {
        if (scene.image) {
            Object.keys(scene.image).forEach(key => {
                const imgUrl = scene.image[key];
                if (typeof imgUrl === 'string' && imgUrl.includes("api.agromonitoring.com/")) {
                    scene.image[key] = `/api/satellite-image?url=${encodeURIComponent(imgUrl)}`;
                }
            });
        }
        if (scene.data) {
            Object.keys(scene.data).forEach(key => {
                const dataUrl = scene.data[key];
                if (typeof dataUrl === 'string' && dataUrl.includes("api.agromonitoring.com/")) {
                    scene.data[key] = `/api/satellite-image?url=${encodeURIComponent(dataUrl)}`;
                }
            });
        }
        return scene;
    });
}

export async function getCurrentWeather(polygonId: string) {
    const apiKey = process.env.AGROMONITORING_API_KEY?.trim();
    if (!apiKey || polygonId.startsWith("DEMO_POLY_ID") || polygonId === "WAITING_API_SYNC") {
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
    if (!apiKey || polygonId.startsWith("DEMO_POLY_ID") || polygonId === "WAITING_API_SYNC") {
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

    if (!apiKey || polygonId.startsWith("DEMO_POLY_ID") || polygonId === "WAITING_API_SYNC") {
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
