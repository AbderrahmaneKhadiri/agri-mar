"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { companyRepository } from "@/persistence/repositories/company.repository";
import { db } from "@/persistence/db";
import { user } from "@/persistence/schema";
import { eq } from "drizzle-orm";
import { farmerProfileSchema } from "@/lib/validations/farmer-profile.schema";
import { companyProfileSchema } from "@/lib/validations/company-profile.schema";
import { z } from "zod";

/**
 * Mise à jour du profil agriculteur
 */
export async function updateFarmerProfileAction(formData: any) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user || session.user.role !== "FARMER") {
            return { error: "Non autorisé" };
        }

        const profile = await farmerRepository.findByUserId(session.user.id);
        if (!profile) return { error: "Profil non trouvé" };

        // Validation partiale pour permettre de ne modifier que certains champs
        const parsed = farmerProfileSchema.partial().safeParse(formData);
        if (!parsed.success) {
            return { error: "Données invalides", fields: parsed.error.flatten().fieldErrors };
        }

        await farmerRepository.update(profile.id, parsed.data);

        // Sync with User name if fullName is updated
        if (parsed.data.fullName) {
            await db.update(user)
                .set({ name: parsed.data.fullName })
                .where(eq(user.id, session.user.id));
        }

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        console.error("updateFarmerProfileAction Error:", error);
        return { error: "Erreur lors de la mise à jour" };
    }
}

/**
 * Mise à jour du profil entreprise
 */
export async function updateCompanyProfileAction(formData: any) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user || session.user.role !== "COMPANY") {
            return { error: "Non autorisé" };
        }

        const profile = await companyRepository.findByUserId(session.user.id);
        if (!profile) return { error: "Profil non trouvé" };

        const parsed = companyProfileSchema.partial().safeParse(formData);
        if (!parsed.success) {
            return { error: "Données invalides", fields: parsed.error.flatten().fieldErrors };
        }

        await companyRepository.update(profile.id, parsed.data);

        // Sync with User name if companyName is updated
        if (parsed.data.companyName) {
            await db.update(user)
                .set({ name: parsed.data.companyName })
                .where(eq(user.id, session.user.id));
        }

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        console.error("updateCompanyProfileAction Error:", error);
        return { error: "Erreur lors de la mise à jour" };
    }
}
