import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { defineAbilityFor } from "@/lib/casl";
import { FarmerProfileInput, farmerProfileSchema } from "@/lib/validations/farmer-profile.schema";

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
        // Note: Drizzle decimal type often expects a string to avoid precision issues
        const profileToInsert = {
            userId,
            ...validatedData.data,
            totalAreaHectares: validatedData.data.totalAreaHectares.toString(),
            updatedAt: new Date(),
        };

        // 4. Business Logic: Check if profile exists
        const existingProfile = await farmerRepository.findByUserId(userId);
        if (existingProfile) {
            return { success: false, error: "Un profil agriculteur existe déjà pour cet utilisateur." };
        }

        // 5. Persistence: Call Repository
        const newProfile = await farmerRepository.create(profileToInsert);

        // 6. Return standardisé
        return { success: true, data: newProfile };
    } catch (error: any) {
        console.error("Erreur createFarmerProfile Service:", error);
        return { success: false, error: "Erreur interne du serveur lors de la création du profil." };
    }
}
