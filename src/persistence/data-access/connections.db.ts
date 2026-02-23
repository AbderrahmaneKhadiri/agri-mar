import { db } from "@/persistence/db";
import { connections, companyProfiles, farmerProfiles } from "@/persistence/schema";
import { and, eq } from "drizzle-orm";

/**
 * RAW QUERY: Récupère les demandes de connexion reçues par un profil (FARMER ou COMPANY).
 */
export async function getIncomingConnectionsFromDb(profileId: string, profileType: "FARMER" | "COMPANY") {
    if (profileType === "FARMER") {
        return await db.query.connections.findMany({
            where: and(
                eq(connections.farmerId, profileId),
                eq(connections.initiatedBy, "COMPANY"),
                eq(connections.status, "PENDING")
            ),
            with: {
                company: true,
            }
        });
    } else {
        return await db.query.connections.findMany({
            where: and(
                eq(connections.companyId, profileId),
                eq(connections.initiatedBy, "FARMER"),
                eq(connections.status, "PENDING")
            ),
            with: {
                farmer: true,
            }
        });
    }
}

/**
 * RAW QUERY: Vérifie si une connexion active (ACCEPTED) existe entre un agriculteur et une entreprise.
 */
export async function checkConnectionStatus(farmerId: string, companyId: string) {
    const record = await db.query.connections.findFirst({
        where: and(
            eq(connections.farmerId, farmerId),
            eq(connections.companyId, companyId)
        )
    });
    return record?.status || null;
}

/**
 * RAW QUERY: Récupère les connexions ACCEPTÉES pour un profil.
 */
export async function getAcceptedPartnersFromDb(profileId: string, profileType: "FARMER" | "COMPANY") {
    if (profileType === "FARMER") {
        return await db.query.connections.findMany({
            where: and(
                eq(connections.farmerId, profileId),
                eq(connections.status, "ACCEPTED")
            ),
            with: {
                company: true,
            }
        });
    } else {
        return await db.query.connections.findMany({
            where: and(
                eq(connections.companyId, profileId),
                eq(connections.status, "ACCEPTED")
            ),
            with: {
                farmer: true,
            }
        });
    }
}
