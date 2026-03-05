"use server";

import { createTender, createTenderBid, updateTenderStatus, updateTenderBidStatus, deleteTenderBid, TenderInsertDTO, TenderBidInsertDTO } from "@/data-access/tenders.dal";
import { companyRepository } from "@/persistence/repositories/company.repository";
import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createTenderAction(data: Omit<TenderInsertDTO, "companyId" | "id" | "createdAt" | "updatedAt" | "status">) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user || session.user.role !== "COMPANY") {
        return { error: "Non autorisé" };
    }

    const companyProfile = await companyRepository.findByUserId(session.user.id);
    if (!companyProfile) {
        return { error: "Profil entreprise introuvable" };
    }

    try {
        const tender = await createTender({
            ...data,
            companyId: companyProfile.id,
            status: "OPEN"
        });

        revalidatePath("/dashboard/company");
        revalidatePath("/dashboard/farmer/market");
        return { success: true, tender };
    } catch (error) {
        console.error("Failed to create tender:", error);
        return { error: "Erreur lors de la création de l'appel d'offre" };
    }
}

export async function createBidAction(tenderId: string, data: Omit<TenderBidInsertDTO, "id" | "tenderId" | "farmerId" | "createdAt" | "updatedAt" | "status">) {
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
        const bid = await createTenderBid({
            ...data,
            tenderId,
            farmerId: farmerProfile.id,
            status: "PENDING"
        });

        revalidatePath("/dashboard/farmer");
        revalidatePath("/dashboard/company");
        return { success: true, bid };
    } catch (error) {
        console.error("Failed to submit bid:", error);
        return { error: "Erreur lors de la soumission de l'offre" };
    }
}

export async function acceptBidAction(bidId: string, tenderId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user || session.user.role !== "COMPANY") {
        return { error: "Non autorisé" };
    }

    try {
        // Accept the bid
        await updateTenderBidStatus(bidId, tenderId, "ACCEPTED");
        // Mark the tender as fulfilled
        await updateTenderStatus(tenderId, (await companyRepository.findByUserId(session.user.id))!.id, "FULFILLED");

        revalidatePath("/dashboard/company");
        return { success: true };
    } catch (error) {
        console.error("Failed to accept bid:", error);
        return { error: "Erreur lors de l'acceptation de l'offre" };
    }
}

export async function deleteBidAction(bidId: string) {
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
        const deleted = await deleteTenderBid(bidId, farmerProfile.id);
        if (!deleted) return { error: "Offre non trouvée ou accès refusé" };

        revalidatePath("/dashboard/farmer");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete bid:", error);
        return { error: "Erreur lors de la suppression de l'offre" };
    }
}
