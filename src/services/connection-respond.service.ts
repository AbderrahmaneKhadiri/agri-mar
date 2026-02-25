import { db } from "@/persistence/db";
import { companyProfiles, connections, farmerProfiles, notifications, messages } from "@/persistence/schema";
import { defineAbilityFor } from "@/lib/casl";
import { ConnectionResponseInput, connectionResponseSchema } from "@/lib/validations/connection.schema";
import { and, eq } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher";

export async function respondToConnectionRequest(
    responderUserId: string,
    responderRole: "FARMER" | "COMPANY" | "ADMIN",
    inputData: ConnectionResponseInput
) {
    try {
        // 1. AuthN
        if (!responderUserId) return { success: false, error: "Non authentifié" };

        // 2. AuthZ (CASL) - Est-ce qu'un agriculteur/entreprise peut modifier une connexion ?
        const ability = defineAbilityFor({ id: responderUserId, role: responderRole });
        if (ability.cannot('update', 'Connection')) {
            return { success: false, error: "Non autorisé à répondre aux connexions" };
        }

        // 3. Validation Zod du payload { connectionId, response: 'ACCEPTED' | 'REJECTED' }
        const validatedData = connectionResponseSchema.safeParse(inputData);
        if (!validatedData.success) {
            return { success: false, error: "Données invalides", details: validatedData.error.flatten() };
        }

        const { connectionId, response } = validatedData.data;

        // 4. Business Logic
        // 4.a: Trouver le profil du répondeur pour s'assurer qu'il est bien impliqué dans la connexion
        let responderProfileId: string;

        if (responderRole === "FARMER") {
            const profile = await db.query.farmerProfiles.findFirst({ where: eq(farmerProfiles.userId, responderUserId) });
            if (!profile) return { success: false, error: "Profil Agriculteur introuvable" };
            responderProfileId = profile.id;
        } else if (responderRole === "COMPANY") {
            const profile = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.userId, responderUserId) });
            if (!profile) return { success: false, error: "Profil Entreprise introuvable" };
            responderProfileId = profile.id;
        } else {
            return { success: false, error: "Rôle invalide pour cette action" }
        }

        // 4.b: Trouver la connexion spécifiée
        const connectionRecord = await db.query.connections.findFirst({
            where: eq(connections.id, connectionId)
        });

        if (!connectionRecord) {
            return { success: false, error: "Connexion introuvable" };
        }

        // 4.c: Vérifier que l'utilisateur qui répond est bien la cible (il ne peut pas répondre à sa propre invitation)
        // Si c'est un farmer qui répond, l'invitation devait provenir d'une company envers ce farmer.
        // Inversement, si c'est une company, l'invitation devait provenir d'un farmer.
        if (responderRole === "FARMER" && connectionRecord.farmerId !== responderProfileId) {
            return { success: false, error: "Vous n'êtes pas le destinataire de cette connexion" };
        }
        if (responderRole === "COMPANY" && connectionRecord.companyId !== responderProfileId) {
            return { success: false, error: "Vous n'êtes pas le destinataire de cette connexion" };
        }

        // 4.d: Vérifier que c'est bien l'autre partie qui a initié
        if (
            (responderRole === "FARMER" && connectionRecord.initiatedBy === "FARMER") ||
            (responderRole === "COMPANY" && connectionRecord.initiatedBy === "COMPANY")
        ) {
            return { success: false, error: "Vous ne pouvez pas répondre à une invitation que vous avez vous-même envoyée" };
        }

        // 4.e: Vérifier le statut actuel
        if (connectionRecord.status !== "PENDING") {
            return { success: false, error: `Impossible de répondre, la connexion est déjà ${connectionRecord.status}` };
        }

        // 5. Mettre à jour la base de données
        const [updatedConnection] = await db.update(connections)
            .set({
                status: response,
                updatedAt: new Date(),
            })
            .where(eq(connections.id, connectionId))
            .returning();

        // 5.5: Si accepté, migrer le message initial vers la table des messages
        if (response === "ACCEPTED" && connectionRecord.initialMessage) {
            try {
                // L'initiateur est celui qui a envoyé le message initial
                let initiatorUserId: string | null = null;
                if (connectionRecord.initiatedBy === "FARMER") {
                    const p = await db.query.farmerProfiles.findFirst({ where: eq(farmerProfiles.id, connectionRecord.farmerId) });
                    initiatorUserId = p?.userId || null;
                } else {
                    const p = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.id, connectionRecord.companyId) });
                    initiatorUserId = p?.userId || null;
                }

                if (initiatorUserId) {
                    await db.insert(messages).values({
                        connectionId: updatedConnection.id,
                        senderUserId: initiatorUserId,
                        content: connectionRecord.initialMessage,
                    });
                }
            } catch (migrateError) {
                console.error("Non-blocking message migration error:", migrateError);
            }
        }

        // 6. Notification pour l'initiateur
        if (response === "ACCEPTED") {
            const initiatorProfileId = connectionRecord.initiatedBy === "FARMER" ? connectionRecord.farmerId : connectionRecord.companyId;
            const responderName = responderRole === "FARMER" ? "Un Agriculteur" : "Une Entreprise";

            // Trouver l'ID utilisateur de l'initiateur
            let initiatorUserId: string | null = null;
            if (connectionRecord.initiatedBy === "FARMER") {
                const p = await db.query.farmerProfiles.findFirst({ where: eq(farmerProfiles.id, initiatorProfileId) });
                initiatorUserId = p?.userId || null;
            } else {
                const p = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.id, initiatorProfileId) });
                initiatorUserId = p?.userId || null;
            }

            if (initiatorUserId) {
                try {
                    const [newNotif] = await db.insert(notifications).values({
                        userId: initiatorUserId,
                        type: "CONNECTION_ACCEPTED",
                        title: "Partenariat accepté",
                        description: `${responderName} a accepté votre demande de connexion !`,
                        link: connectionRecord.initiatedBy === "FARMER" ? "/dashboard/farmer/partners" : "/dashboard/company/suppliers",
                    }).returning();

                    // Trigger Pusher for real-time update
                    await pusherServer.trigger(`user-${initiatorUserId}`, "new-notification", newNotif);
                } catch (notifyError) {
                    console.error("Non-blocking notification error (respondToConnectionRequest):", notifyError);
                }
            }
        }

        return { success: true, data: updatedConnection };

    } catch (error: any) {
        console.error("Erreur respondToConnectionRequest:", error);
        return { success: false, error: "Erreur serveur lors de la réponse" };
    }
}
