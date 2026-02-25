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

        // Handle arrays and booleans manually as Object.fromEntries is too simple
        const cropTypes = formData.getAll("cropTypes") as string[];
        const certifications = formData.getAll("certifications") as string[];
        const farmingMethods = formData.getAll("farmingMethods") as string[];
        const seasonAvailability = formData.getAll("seasonAvailability") as string[];
        const irrigationType = formData.getAll("irrigationType") as string[];
        const businessModel = formData.getAll("businessModel") as string[];

        const hasColdStorage = formData.get("hasColdStorage") === "true" || formData.get("hasColdStorage") === "on";
        const deliveryCapacity = formData.get("deliveryCapacity") === "true" || formData.get("deliveryCapacity") === "on";
        const exportCapacity = formData.get("exportCapacity") === "true" || formData.get("exportCapacity") === "on";
        const logisticsCapacity = formData.get("logisticsCapacity") === "true" || formData.get("logisticsCapacity") === "on";
        const longTermContractAvailable = formData.get("longTermContractAvailable") === "true" || formData.get("longTermContractAvailable") === "on";

        const dataToValidate = {
            ...rawData,
            cropTypes,
            certifications,
            farmingMethods,
            seasonAvailability,
            irrigationType,
            businessModel: businessModel.length > 0 ? businessModel : ["Direct Sales"],
            hasColdStorage,
            deliveryCapacity,
            exportCapacity,
            logisticsCapacity,
            longTermContractAvailable,
        };

        const parsed = farmerProfileSchema.safeParse(dataToValidate);

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

        // Handle optional arrays if any (none yet for company in basic onboarding but for safety)
        const desiredProducts = formData.getAll("desiredProducts") as string[];
        const targetRegions = formData.getAll("targetRegions") as string[];
        const requiredCertifications = formData.getAll("requiredCertifications") as string[];

        const dataToValidate = {
            ...rawData,
            desiredProducts: desiredProducts.length > 0 ? desiredProducts : [],
            targetRegions: targetRegions.length > 0 ? targetRegions : [],
            requiredCertifications: requiredCertifications.length > 0 ? requiredCertifications : [],
        };

        const parsed = companyProfileSchema.safeParse(dataToValidate);

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
