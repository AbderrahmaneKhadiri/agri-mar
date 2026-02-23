"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notificationRepository } from "@/persistence/repositories/notification.repository";
import { revalidatePath } from "next/cache";

/**
 * Récupère les notifications de l'utilisateur actuel.
 */
export async function getNotificationsAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return [];

        return await notificationRepository.findByUserId(session.user.id);
    } catch (error) {
        console.error("getNotificationsAction Error:", error);
        return [];
    }
}

/**
 * Compte les notifications non lues.
 */
export async function getUnreadNotificationsCountAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return 0;

        return await notificationRepository.countUnread(session.user.id);
    } catch (error) {
        console.error("getUnreadNotificationsCountAction Error:", error);
        return 0;
    }
}

/**
 * Marque une notification comme lue.
 */
export async function markNotificationAsReadAction(id: string) {
    try {
        await notificationRepository.markAsRead(id);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("markNotificationAsReadAction Error:", error);
        return { error: "Erreur lors de la mise à jour" };
    }
}

/**
 * Marque toutes les notifications comme lues.
 */
export async function markAllAsReadAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return { error: "Non authentifié" };

        await notificationRepository.markAllAsRead(session.user.id);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("markAllAsReadAction Error:", error);
        return { error: "Erreur lors de la mise à jour" };
    }
}
