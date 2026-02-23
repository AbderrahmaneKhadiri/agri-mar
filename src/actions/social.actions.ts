"use server";

import { farmerRepository } from "@/persistence/repositories/farmer.repository";
import { reviewRepository } from "@/persistence/repositories/review.repository";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Add a photo to farmer gallery
 */
export async function addFarmerPhotoAction(url: string, caption?: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return { error: "Non autorisé" };

    const profile = await farmerRepository.findByUserId(session.user.id);
    if (!profile) return { error: "Profil non trouvé" };

    try {
        await farmerRepository.addPhoto({
            farmerProfileId: profile.id,
            url,
            caption: caption || "",
            isMain: false,
        });
        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (e) {
        return { error: "Erreur lors de l'ajout de la photo" };
    }
}

/**
 * Delete a photo
 */
export async function deleteFarmerPhotoAction(photoId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return { error: "Non autorisé" };

    try {
        await farmerRepository.deletePhoto(photoId);
        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (e) {
        return { error: "Erreur lors de la suppression" };
    }
}

/**
 * Submit a review
 */
export async function submitReviewAction(toUserId: string, rating: number, comment?: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return { error: "Non autorisé" };

    try {
        await reviewRepository.create({
            fromUserId: session.user.id,
            toUserId,
            rating,
            comment: comment || "",
        });
        return { success: true };
    } catch (e) {
        return { error: "Erreur lors de la soumission de l'avis" };
    }
}
