import { companyRepository } from "@/persistence/repositories/company.repository";
import { defineAbilityFor } from "@/lib/casl";
import { CompanyProfileInput, companyProfileSchema } from "@/lib/validations/company-profile.schema";

export async function createCompanyProfile(
    userId: string,
    role: string,
    inputData: CompanyProfileInput
) {
    try {
        // 1. Authorization (AuthZ - RBAC)
        const ability = defineAbilityFor({ id: userId, role });
        if (role !== "COMPANY" && role !== "ADMIN") {
            return { success: false, error: "Accès refusé. Seule une entreprise peut créer ce profil." };
        }

        // 2. Service Validation (Zod)
        const validatedData = companyProfileSchema.safeParse(inputData);
        if (!validatedData.success) {
            return { success: false, error: "Données invalides", details: validatedData.error.flatten() };
        }

        // 3. Data Sanitize
        const profileToInsert = {
            userId,
            ...validatedData.data,
            establishedYear: Number(validatedData.data.establishedYear),
            updatedAt: new Date(),
        };

        // 4. Business Logic: Check if profile exists
        const existingProfile = await companyRepository.findByUserId(userId);
        if (existingProfile) {
            return { success: false, error: "Un profil entreprise existe déjà pour cet utilisateur." };
        }

        // 5. Persistence: Call Repository
        const newProfile = await companyRepository.create(profileToInsert);

        // 6. Return standardisé
        return { success: true, data: newProfile };
    } catch (error: any) {
        console.error("Erreur createCompanyProfile Service:", error);
        return { success: false, error: "Erreur interne du serveur lors de la création du profil." };
    }
}
