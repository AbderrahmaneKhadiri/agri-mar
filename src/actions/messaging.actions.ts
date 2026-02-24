"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/persistence/db";
import { messages, connections, quotes, notifications } from "@/persistence/schema";
import { and, eq, or, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher";

/**
 * Envoie un message dans une conversation établie.
 */
export async function sendMessageAction({ connectionId, content }: { connectionId: string, content: string }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return { error: "Non authentifié" };

        // 1. Vérifier que la connexion existe et est acceptée
        const connection = await db.query.connections.findFirst({
            where: and(
                eq(connections.id, connectionId),
                eq(connections.status, "ACCEPTED")
            ),
            with: {
                farmer: true,
                company: true,
            }
        });

        if (!connection) return { error: "Connexion introuvable ou non acceptée" };

        // 2. Créer le message
        const [newMessage] = await db.insert(messages).values({
            connectionId,
            senderUserId: session.user.id,
            content,
        }).returning();

        // 2.5 Déclencher l'événement Pusher (Temps Réel)
        try {
            await pusherServer.trigger(
                `chat-${connectionId}`,
                "new-message",
                {
                    ...newMessage,
                    type: "MESSAGE",
                    sender: {
                        id: session.user.id,
                        name: session.user.name,
                        image: session.user.image, // session.user structure (might be different if it handles avatar diff)
                        role: session.user.role,
                    }
                }
            );
        } catch (pusherError) {
            console.error("Erreur Pusher (message):", pusherError);
        }

        // 3. Notification pour le destinataire
        const recipientUserId = session.user.id === connection.farmer.userId
            ? connection.company.userId
            : connection.farmer.userId;

        if (recipientUserId) {
            try {
                const [newNotif] = await db.insert(notifications).values({
                    userId: recipientUserId,
                    type: "NEW_MESSAGE",
                    title: "Nouveau message",
                    description: `${session.user.name} vous a envoyé un message.`,
                    link: session.user.role === "FARMER" ? "/dashboard/company/messages" : "/dashboard/farmer/messages",
                }).returning();

                // 3.5 Déclencher l'événement de notification (Temps Réel)
                await pusherServer.trigger(`user-${recipientUserId}`, "new-notification", newNotif);
            } catch (notifyError) {
                console.error("Non-blocking notification error (sendMessageAction):", notifyError);
            }
        }

        revalidatePath(`/dashboard/farmer/messages`);
        revalidatePath(`/dashboard/company/messages`);

        return { success: true, data: newMessage };

    } catch (error) {
        console.error("Error sendMessageAction:", error);
        return { error: "Erreur lors de l'envoi du message" };
    }
}

/**
 * Récupère l'historique d'une conversation.
 */
export async function getConversationAction(connectionId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) throw new Error("Non authentifié");

        const [history, quoteHistory] = await Promise.all([
            db.query.messages.findMany({
                where: eq(messages.connectionId, connectionId),
                orderBy: [asc(messages.createdAt)],
                with: {
                    sender: {
                        columns: {
                            id: true,
                            name: true,
                            image: true,
                            role: true,
                        }
                    }
                }
            }),
            db.query.quotes.findMany({
                where: eq(quotes.connectionId, connectionId),
                orderBy: [asc(quotes.createdAt)]
            })
        ]);

        // Unifier et trier par date
        const unified = [
            ...history.map(m => ({ ...m, type: "MESSAGE" })),
            ...quoteHistory.map(q => ({ ...q, type: "QUOTE" }))
        ].sort((a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        return unified;
    } catch (error) {
        console.error("Error getConversationAction:", error);
        return [];
    }
}
