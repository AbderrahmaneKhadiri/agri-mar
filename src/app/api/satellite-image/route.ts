import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const targetUrl = req.nextUrl.searchParams.get("url");
    if (!targetUrl) return new NextResponse("Missing URL", { status: 400 });

    const apiKey = process.env.AGROMONITORING_API_KEY?.trim();
    if (!apiKey) return new NextResponse("API Configuration Error", { status: 500 });

    // Validate target domain to prevent SSRF
    const isAgroMonitoring = targetUrl.includes("api.agromonitoring.com/");
    if (!isAgroMonitoring) {
        console.warn(`[PROXY] Blocked unauthorized domain request: ${targetUrl}`);
        return new NextResponse("Invalid image source", { status: 403 });
    }

    try {
        // Use URL object to properly inject/replace the appid parameter
        const parsedUrl = new URL(targetUrl);
        console.log("[PROXY] Original targetUrl:", targetUrl);
        parsedUrl.searchParams.set("appid", apiKey);

        const fullUrl = parsedUrl.toString();
        console.log("[PROXY] Fetching:", fullUrl);

        const response = await fetch(fullUrl);
        console.log(`[PROXY] Upstream Status: ${response.status} for ${fullUrl}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[PROXY] Upstream Error Body: ${errorText}`);
            return new NextResponse(`Upstream error: ${response.statusText}`, { status: response.status });
        }

        // Pass headers, especially Content-Type
        const headers = new Headers();
        const contentType = response.headers.get("content-type");
        if (contentType) headers.set("Content-Type", contentType);
        headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800");

        // Return the raw byte stream directly
        return new NextResponse(response.body, { headers });
    } catch (e: any) {
        console.error("[PROXY] Error:", e);
        return new NextResponse("Error fetching image", { status: 500 });
    }
}
