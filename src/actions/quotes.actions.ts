"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { quoteRepository } from "@/persistence/repositories/quote.repository";
import { notificationRepository } from "@/persistence/repositories/notification.repository";
import { revalidatePath } from "next/cache";

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
        if (fullQuote) {
            const recipientUserId = session.user.id === fullQuote.connection.farmer.userId
                ? fullQuote.connection.company.userId
                : fullQuote.connection.farmer.userId;

            if (recipientUserId) {
                try {
                    await notificationRepository.create({
                        userId: recipientUserId,
                        type: "NEW_QUOTE",
                        title: "Nouveau devis reçu",
                        description: `${session.user.name} vous a envoyé une proposition commerciale pour ${formData.productName}.`,
                        link: session.user.role === "FARMER" ? "/dashboard/company/messages" : "/dashboard/farmer/messages"
                    });
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
                await notificationRepository.create({
                    userId: quote.senderUserId,
                    type: "QUOTE_ACCEPTED",
                    title: "Devis accepté !",
                    description: `${session.user.name} a accepté votre devis pour ${quote.productName}.`,
                    link: session.user.role === "FARMER" ? "/dashboard/company/messages" : "/dashboard/farmer/messages"
                });
            } catch (notifyError) {
                console.error("Non-blocking notification error (respondToQuoteAction):", notifyError);
            }
        }

        revalidatePath("/dashboard");
        return { success: true, data: updatedQuote };
    } catch (error) {
        console.error("respondToQuoteAction Error:", error);
        return { error: "Erreur lors de la réponse au devis" };
    }
}

/**
 * Récupère le dernier devis en attente pour une connexion.
 */
export async function getLatestPendingQuoteAction(connectionId: string) {
    try {
        return await quoteRepository.findLatestPending(connectionId);
    } catch (error) {
        console.error("getLatestPendingQuoteAction Error:", error);
        return null;
    }
}
