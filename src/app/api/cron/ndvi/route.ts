import { NextResponse } from "next/server";
import { db } from "@/persistence/db";
import { parcels } from "@/persistence/schema";
import { getHistoricalIndexAction } from "@/actions/agromonitoring.actions";
import { createNotification } from "@/data-access/notifications.dal";

/**
 * Endpoint for Cron Job to verify NDVI health on active parcels
 * Should ideally be triggered daily by Vercel Cron.
 */
export async function GET(request: Request) {
    // Add simple authentication (e.g. Bearer token check for Vercel Cron bypass)
    // For now we allow it for testing if called internally or without auth
    const authHeader = request.headers.get("authorization");
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    try {
        // 1. Get all active parcels that have polygon IDs
        const allParcels = await db.query.parcels.findMany({
            with: {
                farmer: {
                    with: {
                        user: true
                    }
                }
            }
        });

        let alertsGenerated = 0;

        // 2. Iterate through each and check the latest NDVI
        for (const parcel of allParcels) {
            if (!parcel.polygonId || parcel.polygonId === "WAITING_API_SYNC") continue;

            // Fetch NDVI Data 
            const ndviResponse = await getHistoricalIndexAction(parcel.polygonId, "ndvi");
            const dataP = ndviResponse.data;

            if (dataP && dataP.length > 0) {
                // Get the most recent data point
                const latest = dataP.sort((a: any, b: any) => b.dt - a.dt)[0];

                // If the mean is critically low (Stress Hydrique)
                if (latest.data && latest.data.mean < 0.35) {
                    // Create Notification for the Farmer
                    await createNotification({
                        userId: parcel.farmer.user.id,
                        type: "SYSTEM_ALERT",
                        title: "🚨 Alerte Stress Hydrique",
                        description: `Le niveau NDVI de votre parcelle "${parcel.name}" est anormalement bas (${latest.data.mean.toFixed(2)}). Vérifiez votre système d'irrigation.`,
                        link: "/dashboard/farmer",
                    });
                    alertsGenerated++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "NDVI Cron task completed successfully",
            parcelsScanned: allParcels.length,
            alertsGenerated
        });

    } catch (error) {
        console.error("Cron NDVI execution failed:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
