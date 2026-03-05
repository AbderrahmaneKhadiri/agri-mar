"use server";

import { createHarvestPlan, updateHarvestStatus, deleteHarvestPlan, updateHarvestActuals, HarvestPlanInsertDTO } from "@/data-access/harvests.dal";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createHarvestPlanAction(data: Omit<HarvestPlanInsertDTO, "id" | "farmerId" | "createdAt" | "updatedAt">) {
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
        const plan = await createHarvestPlan({
            ...data,
            farmerId: farmerProfile.id,
            status: data.status || "PLANNED"
        });

        revalidatePath("/dashboard/farmer");
        return { success: true, plan };
    } catch (error) {
        console.error("Failed to create harvest plan:", error);
        return { error: "Erreur lors de la création de la planification" };
    }
}

export async function updateHarvestStatusAction(id: string, status: any, actualHarvestDate?: Date) {
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
        await updateHarvestStatus(id, farmerProfile.id, status, actualHarvestDate);
        revalidatePath("/dashboard/farmer");
        return { success: true };
    } catch (error) {
        console.error("Failed to update harvest status:", error);
        return { error: "Erreur lors de la mise à jour du statut" };
    }
}

export async function updateHarvestActualsAction(id: string, data: { actualYield: string; actualSalePrice: string; actualHarvestDate: Date }) {
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
        await updateHarvestActuals(id, farmerProfile.id, data);
        revalidatePath("/dashboard/farmer");
        return { success: true };
    } catch (error) {
        console.error("Failed to update harvest actuals:", error);
        return { error: "Erreur lors de l'enregistrement de la récolte" };
    }
}

export async function deleteHarvestPlanAction(id: string) {
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
        await deleteHarvestPlan(id, farmerProfile.id);
        revalidatePath("/dashboard/farmer");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete harvest plan:", error);
        return { error: "Erreur lors de la suppression" };
    }
}
