"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notificationRepository } from "@/persistence/repositories/notification.repository";
import { revalidatePath } from "next/cache";
import { db } from "@/persistence/db";
import { notifications } from "@/persistence/schema";
import { and, eq, like } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher";

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
 * Récupère les comptes de notifications non lues par catégorie.
 */
export async function getUnreadCountsByCategoryAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return { messages: 0, requests: 0 };

        return await notificationRepository.countUnreadByCategory(session.user.id);
    } catch (error) {
        console.error("getUnreadCountsByCategoryAction Error:", error);
        return { messages: 0, requests: 0 };
    }
}

/**
 * Marque une notification comme lue.
 */
export async function markNotificationAsReadAction(id: string) {
    try {
        await notificationRepository.markAsRead(id);

        // Trigger sync
        const session = await auth.api.getSession({ headers: await headers() });
        if (session?.user) {
            await pusherServer.trigger(`user-${session.user.id}`, "notifications-refresh", {});
        }

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

        // Trigger sync
        await pusherServer.trigger(`user-${session.user.id}`, "notifications-refresh", {});

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("markAllAsReadAction Error:", error);
        return { error: "Erreur lors de la mise à jour" };
    }
}

/**
 * Marque les notifications comme lues basées sur une partie du lien.
 */
export async function markNotificationsAsReadByLinkAction(linkPart: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return { error: "Non authentifié" };

        await db.update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.userId, session.user.id),
                eq(notifications.isRead, false),
                like(notifications.link, `%${linkPart}%`)
            ));

        // Trigger sync
        await pusherServer.trigger(`user-${session.user.id}`, "notifications-refresh", {});

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("markNotificationsAsReadByLinkAction Error:", error);
        return { error: "Erreur lors de la mise à jour" };
    }
}

/**
 * Marque TOUTES les notifications de messages comme lues.
 */
export async function markAllMessageNotificationsAsReadAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return { error: "Non authentifié" };

        await db.update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.userId, session.user.id),
                eq(notifications.isRead, false),
                eq(notifications.type, "NEW_MESSAGE")
            ));

        // Trigger sync
        await pusherServer.trigger(`user-${session.user.id}`, "notifications-refresh", {});

        try {
            revalidatePath("/dashboard");
        } catch (e) {
            // Ignore revalidation errors during render
            console.warn("revalidatePath skipped during render");
        }

        return { success: true };
    } catch (error) {
        console.error("markAllMessageNotificationsAsReadAction Error:", error);
        return { error: "Erreur lors de la mise à jour" };
    }
}
