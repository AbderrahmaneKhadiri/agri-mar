import { db } from "@/persistence/db";
import { companyProfiles, connections, farmerProfiles, notifications } from "@/persistence/schema";
import { defineAbilityFor } from "@/lib/casl";
import { ConnectionRequestInput, connectionRequestSchema } from "@/lib/validations/connection.schema";
import { and, eq, or } from "drizzle-orm";

export async function createConnectionRequest(
    initiatorUserId: string,
    initiatorRole: "FARMER" | "COMPANY" | "ADMIN",
    inputData: ConnectionRequestInput
) {
    try {
        // 1. AuthN
        if (!initiatorUserId) return { success: false, error: "Non authentifié" };

        // 2. AuthZ (C'est un farmer ou une company qui veut créer une connexion)
        const ability = defineAbilityFor({ id: initiatorUserId, role: initiatorRole });
        if (ability.cannot('create', 'Connection')) {
            return { success: false, error: "Non autorisé à créer une connexion" };
        }

        // 3. Validation
        const validatedData = connectionRequestSchema.safeParse(inputData);
        if (!validatedData.success) {
            return { success: false, error: "Données invalides", details: validatedData.error.flatten() };
        }

        const { targetId } = validatedData.data;

        // 4. Business Logic Complexes
        let initiatorProfileId: string | null = null;
        let targetProfileId: string | null = null;
        let farmerIdFromRelation: string;
        let companyIdFromRelation: string;

        // 4.a: Résolution des profils selon qui invite qui
        if (initiatorRole === "FARMER") {
            const initiatorProfile = await db.query.farmerProfiles.findFirst({ where: eq(farmerProfiles.userId, initiatorUserId) });
            if (!initiatorProfile) return { success: false, error: "Vous n'avez pas terminé votre Onboarding Agriculteur" };
            initiatorProfileId = initiatorProfile.id;

            const targetProfile = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.id, targetId) });
            if (!targetProfile) return { success: false, error: "Entreprise cible introuvable" };
            targetProfileId = targetProfile.id;

            farmerIdFromRelation = initiatorProfile.id;
            companyIdFromRelation = targetProfile.id;
        } else if (initiatorRole === "COMPANY") {
            const initiatorProfile = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.userId, initiatorUserId) });
            if (!initiatorProfile) return { success: false, error: "Vous n'avez pas terminé votre Onboarding Entreprise" };
            initiatorProfileId = initiatorProfile.id;

            const targetProfile = await db.query.farmerProfiles.findFirst({ where: eq(farmerProfiles.id, targetId) });
            if (!targetProfile) return { success: false, error: "Agriculteur cible introuvable" };
            targetProfileId = targetProfile.id;

            companyIdFromRelation = initiatorProfile.id;
            farmerIdFromRelation = targetProfile.id;
        } else {
            return { success: false, error: "Rôle invalide pour cette action" };
        }

        // 4.b: Vérifier si la connexion existe déjà (PENDING ou ACCEPTED)
        const existingConnection = await db.query.connections.findFirst({
            where: and(
                eq(connections.farmerId, farmerIdFromRelation),
                eq(connections.companyId, companyIdFromRelation)
            )
        });

        if (existingConnection) {
            if (existingConnection.status === "PENDING") {
                return { success: false, error: "Une demande de connexion est déjà en attente entre ces deux profils" };
            }
            if (existingConnection.status === "ACCEPTED") {
                return { success: false, error: "Une connexion active existe déjà" };
            }
            // Si REJECTED, la logique métier peut soit refuser, soit permettre de relancer.
            // Pour AgriMar, interdisons le spamming direct.
            if (existingConnection.status === "REJECTED") {
                return { success: false, error: "La demande a été précédemment rejetée" };
            }
        }

        // 5. Persistence
        const [newConnection] = await db.insert(connections).values({
            farmerId: farmerIdFromRelation,
            companyId: companyIdFromRelation,
            status: "PENDING",
            initiatedBy: initiatorRole,
        }).returning();

        // 6. Notification pour le destinataire
        let recipientUserId: string | null = null;
        if (initiatorRole === "FARMER") {
            const p = await db.query.companyProfiles.findFirst({ where: eq(companyProfiles.id, targetId) });
            recipientUserId = p?.userId || null;
        } else {
            const p = await db.query.farmerProfiles.findFirst({ where: eq(farmerProfiles.id, targetId) });
            recipientUserId = p?.userId || null;
        }

        const initiatorName = initiatorRole === "FARMER" ? "Un Agriculteur" : "Une Entreprise";

        if (recipientUserId) {
            try {
                await db.insert(notifications).values({
                    userId: recipientUserId,
                    type: "CONNECTION_REQUEST",
                    title: "Nouvelle demande de connexion",
                    description: `${initiatorName} souhaite se connecter avec vous.`,
                    link: initiatorRole === "FARMER" ? "/dashboard/company/market" : "/dashboard/farmer/requests",
                });
            } catch (notifyError) {
                console.error("Non-blocking notification error (createConnectionRequest):", notifyError);
            }
        }

        return { success: true, data: newConnection };

    } catch (error: any) {
        console.error("Erreur createConnectionRequest COMPLETE ERROR:", error);
        return { success: false, error: "Erreur serveur lors de la demande de connexion" };
    }
}
