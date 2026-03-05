"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { quoteRepository } from "@/persistence/repositories/quote.repository";
import { notificationRepository } from "@/persistence/repositories/notification.repository";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher";

/**
 * Crée un nouveau devis.
 */
export async function createQuoteAction(formData: {
    connectionId: string,
    productName: string,
    quantity: string,
    unitPrice: string,
    totalAmount: string,
    currency?: string,
    notes?: string
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return { error: "Non authentifié" };

        const quote = await quoteRepository.create({
            ...formData,
            senderUserId: session.user.id,
            status: "PENDING"
        });

        // Notification pour le destinataire
        const fullQuote = await quoteRepository.findById(quote.id);
        if (fullQuote && fullQuote.connection && fullQuote.connection.farmer && fullQuote.connection.company) {
            const recipientUserId = session.user.id === fullQuote.connection.farmer.userId
                ? fullQuote.connection.company.userId
                : fullQuote.connection.farmer.userId;

            // Déclencher Pusher pour le Chat (Temps Réel)
            try {
                await pusherServer.trigger(
                    `chat-${formData.connectionId}`,
                    "new-message",
                    {
                        ...quote,
                        type: "QUOTE",
                        sender: {
                            id: session.user.id,
                            name: session.user.name,
                            image: session.user.image,
                            role: session.user.role,
                        }
                    }
                );
            } catch (pusherError) {
                console.error("Pusher Error (Quote):", pusherError);
            }

            if (recipientUserId) {
                try {
                    const notify = await notificationRepository.create({
                        userId: recipientUserId,
                        type: "NEW_QUOTE",
                        title: "Nouveau devis reçu",
                        description: `${session.user.name} vous a envoyé une proposition commerciale pour ${formData.productName}.`,
                        link: session.user.role === "FARMER" ? "/dashboard/company/messages" : "/dashboard/farmer/messages"
                    });

                    // Pusher pour la cloche de notification
                    await pusherServer.trigger(`user-${recipientUserId}`, "new-notification", notify);
                } catch (notifyError) {
                    console.error("Non-blocking notification error (createQuoteAction):", notifyError);
                }
            }
        }

        revalidatePath("/dashboard");
        return { success: true, data: quote };
    } catch (error) {
        console.error("createQuoteAction Error:", error);
        return { error: "Erreur lors de la création du devis" };
    }
}

/**
 * Répond à un devis (Accepter/Refuser).
 */
export async function respondToQuoteAction(quoteId: string, response: "ACCEPTED" | "DECLINED") {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return { error: "Non authentifié" };

        const quote = await quoteRepository.findById(quoteId);
        if (!quote) return { error: "Devis introuvable" };

        if (!quote.connection || !quote.connection.farmer || !quote.connection.company) return { error: "Données de connexion incomplètes" };

        // Seul le destinataire peut répondre
        const recipientUserId = session.user.id === quote.connection.farmer.userId
            ? quote.connection.farmer.userId
            : quote.connection.company.userId;

        if (session.user.id === quote.senderUserId) {
            return { error: "Vous ne pouvez pas répondre à votre propre devis" };
        }

        const updatedQuote = await quoteRepository.updateStatus(quoteId, response);

        if (response === "ACCEPTED") {
            try {
                const notify = await notificationRepository.create({
                    userId: quote.senderUserId,
                    type: "QUOTE_ACCEPTED",
                    title: "Devis accepté !",
                    description: `${session.user.name} a accepté votre devis pour ${quote.productName}.`,
                    link: session.user.role === "FARMER" ? "/dashboard/company/messages" : "/dashboard/farmer/messages"
                });

                // Pusher pour la cloche de notification
                await pusherServer.trigger(`user-${quote.senderUserId}`, "new-notification", notify);
            } catch (notifyError) {
                console.error("Non-blocking notification error (respondToQuoteAction):", notifyError);
            }
        }

        // Déclencher Pusher pour mettre à jour le statut du devis dans le chat du partenaire
        try {
            await pusherServer.trigger(
                `chat-${quote.connectionId}`,
                "quote-status-update",
                {
                    quoteId,
                    status: response
                }
            );
        } catch (pusherError) {
            console.error("Pusher Error (Quote Status Change):", pusherError);
        }

        revalidatePath("/dashboard");
        return { success: true, data: updatedQuote };
    } catch (error) {
        console.error("respondToQuoteAction Error:", error);
        return { error: "Erreur lors de la réponse au devis" };
    }
}

/**
 * Crée une contre-offre liée à un devis existant.
 */
export async function createCounterOfferAction(formData: {
    parentQuoteId: string,
    quantity: string,
    unitPrice: string,
    totalAmount: string,
    notes?: string
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return { error: "Non authentifié" };

        const parentQuote = await quoteRepository.findById(formData.parentQuoteId);
        if (!parentQuote) return { error: "Devis parent introuvable" };

        // Marquer le devis parent comme "En négociation"
        await quoteRepository.updateStatus(formData.parentQuoteId, "NEGOTIATING");

        // Créer la contre-offre
        const counterOffer = await quoteRepository.create({
            connectionId: parentQuote.connectionId,
            productName: parentQuote.productName,
            quantity: formData.quantity,
            unitPrice: formData.unitPrice,
            totalAmount: formData.totalAmount,
            notes: formData.notes,
            senderUserId: session.user.id,
            parentQuoteId: formData.parentQuoteId,
            status: "PENDING"
        });

        if (!parentQuote.connection || !parentQuote.connection.farmer || !parentQuote.connection.company) return { error: "Données de connexion parent incomplètes" };

        const recipientUserId = session.user.id === parentQuote.connection.farmer.userId
            ? parentQuote.connection.company.userId
            : parentQuote.connection.farmer.userId;

        // Pusher pour le Chat
        try {
            await pusherServer.trigger(
                `chat-${parentQuote.connectionId}`,
                "new-message",
                {
                    ...counterOffer,
                    type: "QUOTE",
                    sender: {
                        id: session.user.id,
                        name: session.user.name,
                        image: session.user.image,
                        role: session.user.role,
                    }
                }
            );

            // Également mettre à jour l'état visuel du devis parent dans le chat
            await pusherServer.trigger(
                `chat-${parentQuote.connectionId}`,
                "quote-status-update",
                {
                    quoteId: formData.parentQuoteId,
                    status: "NEGOTIATING"
                }
            );
        } catch (pusherError) {
            console.error("Pusher Error (Counter-Offer):", pusherError);
        }

        if (recipientUserId) {
            try {
                const notify = await notificationRepository.create({
                    userId: recipientUserId,
                    type: "NEW_QUOTE",
                    title: "Contre-offre reçue",
                    description: `${session.user.name} a envoyé une contre-offre pour ${parentQuote.productName}.`,
                    link: session.user.role === "FARMER" ? "/dashboard/company/messages" : "/dashboard/farmer/messages"
                });
                await pusherServer.trigger(`user-${recipientUserId}`, "new-notification", notify);
            } catch (notifyError) {
                console.error("Non-blocking notification error (createCounterOfferAction):", notifyError);
            }
        }

        revalidatePath("/dashboard");
        return { success: true, data: counterOffer };
    } catch (error) {
        console.error("createCounterOfferAction Error:", error);
        return { error: "Erreur lors de la création de la contre-offre" };
    }
}

/**
 * Récupère l'historique de négociation d'un devis.
 */
export async function getQuoteHistoryAction(quoteId: string) {
    try {
        return await quoteRepository.findNegotiationHistory(quoteId);
    } catch (error) {
        console.error("getQuoteHistoryAction Error:", error);
        return [];
    }
}
