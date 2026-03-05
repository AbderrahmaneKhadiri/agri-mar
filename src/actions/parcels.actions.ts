"use server";

import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { createPolygonOnAgroMonitoring } from "@/services/agromonitoring.service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createParcelAction(data: { geoJson: string; area: string }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user || session.user.role !== "FARMER") {
        return { error: "Non autorisé" };
    }

    const farmerProfile = await farmerRepository.findByUserId(session.user.id);
    if (!farmerProfile) {
        return { error: "Profil agriculteur introuvable" };
    }

    try {
        let apiPolygonId = "WAITING_API_SYNC";
        try {
            const parsedGeo = JSON.parse(data.geoJson);
            const apiResponse = await createPolygonOnAgroMonitoring(`Farm_${farmerProfile.id.substring(0, 8)}`, parsedGeo);
            apiPolygonId = apiResponse.id;
        } catch (err) {
            console.error("AgroMonitoring API Sync Failed:", err);
        }

        const parcel = await farmerRepository.createParcel(
            farmerProfile.id,
            data.geoJson,
            data.area,
            apiPolygonId
        );

        revalidatePath("/dashboard/farmer");
        return { success: true, parcel };
    } catch (error) {
        console.error("Failed to create parcel:", error);
        return { error: "Erreur lors de la création de la parcelle" };
    }
}
