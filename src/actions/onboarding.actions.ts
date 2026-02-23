"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createFarmerProfile } from "@/services/farmer-onboarding.service";
import { createCompanyProfile } from "@/services/company-onboarding.service";
import { farmerProfileSchema } from "@/lib/validations/farmer-profile.schema";
import { companyProfileSchema } from "@/lib/validations/company-profile.schema";

export async function submitFarmerOnboardingAction(prevState: any, formData: FormData) {
    try {
        // 1. Get Session
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return { error: "Non authentifié" };
        }

        // 2. Extraction & Validation (Presentation Layer)
        const rawData = Object.fromEntries(formData);
        const parsed = farmerProfileSchema.safeParse(rawData);

        if (!parsed.success) {
            return { error: "Données invalides", fields: parsed.error.flatten().fieldErrors };
        }

        // 3. Call Service (Service Layer)
        const result = await createFarmerProfile(session.user.id, session.user.role, parsed.data);

        if (!result.success) {
            return { error: result.error };
        }

        // 4. Success -> Redirect
        revalidatePath("/dashboard");
        redirect("/dashboard");
    } catch (error: any) {
        if (error.message === "NEXT_REDIRECT") throw error;
        console.error("Farmer Onboarding Action Error:", error);
        return { error: "Une erreur inattendue est survenue" };
    }
}

export async function submitCompanyOnboardingAction(prevState: any, formData: FormData) {
    try {
        // 1. Get Session
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return { error: "Non authentifié" };
        }

        // 2. Extraction & Validation
        const rawData = Object.fromEntries(formData);
        const parsed = companyProfileSchema.safeParse(rawData);

        if (!parsed.success) {
            return { error: "Données invalides", fields: parsed.error.flatten().fieldErrors };
        }

        // 3. Call Service
        const result = await createCompanyProfile(session.user.id, session.user.role, parsed.data);

        if (!result.success) {
            return { error: result.error };
        }

        // 4. Success -> Redirect
        revalidatePath("/dashboard");
        redirect("/dashboard");
    } catch (error: any) {
        if (error.message === "NEXT_REDIRECT") throw error;
        console.error("Company Onboarding Action Error:", error);
        return { error: "Une erreur inattendue est survenue" };
    }
}
