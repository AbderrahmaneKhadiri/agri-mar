import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { defineAbilityFor } from "@/lib/casl";
import { FarmerProfileInput, farmerProfileSchema } from "@/lib/validations/farmer-profile.schema";
import { createPolygonOnAgroMonitoring } from "@/services/agromonitoring.service";

export async function createFarmerProfile(
    userId: string,
    role: string,
    inputData: FarmerProfileInput
) {
    try {
        // 1. Authorization (AuthZ - RBAC)
        const ability = defineAbilityFor({ id: userId, role });
        if (role !== "FARMER" && role !== "ADMIN") {
            return { success: false, error: "Accès refusé. Seul un agriculteur peut créer ce profil." };
        }

        // 2. Service Validation (Zod)
        const validatedData = farmerProfileSchema.safeParse(inputData);
        if (!validatedData.success) {
            return { success: false, error: "Données invalides", details: validatedData.error.flatten() };
        }

        // 3. Data Sanitize
        // 3. Data Sanitize
        const { parcelGeoJson, ...profileData } = validatedData.data;

        const profileToInsert = {
            userId,
            ...profileData,
            updatedAt: new Date(),
        };

        // 4. Business Logic: Check if profile exists
        const existingProfile = await farmerRepository.findByUserId(userId);
        if (existingProfile) {
            return { success: false, error: "Un profil agriculteur existe déjà pour cet utilisateur." };
        }

        // 5. Persistence: Call Repository
        const newProfile = await farmerRepository.create(profileToInsert);

        // Save Polygon if provided
        if (parcelGeoJson && parcelGeoJson !== "") {
            let apiPolygonId = "WAITING_API_SYNC";
            try {
                // 1. Call AgroMonitoring API
                const parsedGeo = JSON.parse(parcelGeoJson);
                const apiResponse = await createPolygonOnAgroMonitoring(`Farm_${newProfile.id.substring(0, 8)}`, parsedGeo);
                apiPolygonId = apiResponse.id;
            } catch (err) {
                console.error("AgroMonitoring API Sync Failed (Onboarding continues):", err);
            }

            // 2. Save to our database (even if API failed, we save the GeoJSON)
            try {
                await farmerRepository.createParcel(
                    newProfile.id,
                    parcelGeoJson,
                    profileData.totalAreaHectares || "0",
                    apiPolygonId
                );
            } catch (dbErr) {
                console.error("Critical error saving parcel to DB:", dbErr);
            }
        }

        // 6. Return standardisé
        return { success: true, data: newProfile };
    } catch (error: any) {
        console.error("Erreur createFarmerProfile Service:", error);
        return { success: false, error: "Erreur interne du serveur lors de la création du profil." };
    }
}
