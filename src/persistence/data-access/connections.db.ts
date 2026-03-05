import { db } from "@/persistence/db";
import { connections, companyProfiles, farmerProfiles, parcels } from "@/persistence/schema";
import { and, eq, sql, inArray, desc } from "drizzle-orm";

/**
 * RAW QUERY: Récupère les demandes de connexion reçues par un profil (FARMER ou COMPANY).
 */
export async function getIncomingConnectionsFromDb(profileId: string, profileType: "FARMER" | "COMPANY") {
    if (profileType === "FARMER") {
        const results = await db.select({
            id: connections.id,
            farmerId: connections.farmerId,
            companyId: connections.companyId,
            status: connections.status,
            initiatedBy: connections.initiatedBy,
            initialMessage: connections.initialMessage,
            createdAt: connections.createdAt,
            updatedAt: connections.updatedAt,
            company: companyProfiles,
        })
            .from(connections)
            .leftJoin(companyProfiles, eq(connections.companyId, companyProfiles.id))
            .where(and(
                eq(connections.farmerId, profileId),
                eq(connections.initiatedBy, "COMPANY"),
                eq(connections.status, "PENDING")
            ));

        return results;
    } else {
        const results = await db.select({
            id: connections.id,
            farmerId: connections.farmerId,
            companyId: connections.companyId,
            status: connections.status,
            initiatedBy: connections.initiatedBy,
            initialMessage: connections.initialMessage,
            createdAt: connections.createdAt,
            updatedAt: connections.updatedAt,
            farmer: farmerProfiles,
            // We'll map parcels separately or join them
        })
            .from(connections)
            .leftJoin(farmerProfiles, eq(connections.farmerId, farmerProfiles.id))
            .where(and(
                eq(connections.companyId, profileId),
                eq(connections.initiatedBy, "FARMER"),
                eq(connections.status, "PENDING")
            ));

        // For each farmer, we might need their parcels. 
        // To keep it simple and avoid lateral joins, we fetch all parcels for these farmers.
        const farmerIds = results.filter(r => r.farmer).map(r => r.farmer!.id);
        const allParcels = farmerIds.length > 0 ? await db.select().from(parcels).where(inArray(parcels.farmerId, farmerIds)).orderBy(desc(parcels.createdAt)) : [];

        return results.map(r => ({
            ...r,
            farmer: r.farmer ? {
                ...r.farmer,
                parcels: allParcels.filter(p => p.farmerId === r.farmer!.id)
            } : null
        }));
    }
}

/**
 * RAW QUERY: Vérifie si une connexion active (ACCEPTED) existe entre un agriculteur et une entreprise.
 */
export async function checkConnectionStatus(farmerId: string, companyId: string) {
    const results = await db.select({ status: connections.status })
        .from(connections)
        .where(and(
            eq(connections.farmerId, farmerId),
            eq(connections.companyId, companyId)
        ))
        .limit(1);

    return results[0]?.status || null;
}

/**
 * RAW QUERY: Récupère les connexions ACCEPTÉES pour un profil.
 */
export async function getAcceptedPartnersFromDb(profileId: string, profileType: "FARMER" | "COMPANY") {
    if (profileType === "FARMER") {
        const results = await db.select({
            id: connections.id,
            farmerId: connections.farmerId,
            companyId: connections.companyId,
            status: connections.status,
            initiatedBy: connections.initiatedBy,
            initialMessage: connections.initialMessage,
            createdAt: connections.createdAt,
            updatedAt: connections.updatedAt,
            company: companyProfiles,
        })
            .from(connections)
            .leftJoin(companyProfiles, eq(connections.companyId, companyProfiles.id))
            .where(and(
                eq(connections.farmerId, profileId),
                eq(connections.status, "ACCEPTED")
            ));

        return results;
    } else {
        const results = await db.select({
            id: connections.id,
            farmerId: connections.farmerId,
            companyId: connections.companyId,
            status: connections.status,
            initiatedBy: connections.initiatedBy,
            initialMessage: connections.initialMessage,
            createdAt: connections.createdAt,
            updatedAt: connections.updatedAt,
            farmer: farmerProfiles,
        })
            .from(connections)
            .leftJoin(farmerProfiles, eq(connections.farmerId, farmerProfiles.id))
            .where(and(
                eq(connections.companyId, profileId),
                eq(connections.status, "ACCEPTED")
            ));

        const farmerIds = results.map(r => r.farmer!.id);
        const allParcels = farmerIds.length > 0 ? await db.select().from(parcels).where(inArray(parcels.farmerId, farmerIds)).orderBy(desc(parcels.createdAt)) : [];

        return results.map(r => ({
            ...r,
            farmer: r.farmer ? {
                ...r.farmer,
                parcels: allParcels.filter(p => p.farmerId === r.farmer!.id)
            } : null
        }));
    }
}

/**
 * RAW QUERY: Récupère les demandes de connexion ENVOYÉES par un profil.
 */
export async function getOutgoingConnectionsFromDb(profileId: string, profileType: "FARMER" | "COMPANY") {
    if (profileType === "COMPANY") {
        const results = await db.select({
            id: connections.id,
            farmerId: connections.farmerId,
            companyId: connections.companyId,
            status: connections.status,
            initiatedBy: connections.initiatedBy,
            initialMessage: connections.initialMessage,
            createdAt: connections.createdAt,
            updatedAt: connections.updatedAt,
            farmer: farmerProfiles,
        })
            .from(connections)
            .leftJoin(farmerProfiles, eq(connections.farmerId, farmerProfiles.id))
            .where(and(
                eq(connections.companyId, profileId),
                eq(connections.initiatedBy, "COMPANY"),
                eq(connections.status, "PENDING")
            ));

        const farmerIds = results.map(r => r.farmer!.id);
        const allParcels = farmerIds.length > 0 ? await db.select().from(parcels).where(inArray(parcels.farmerId, farmerIds)).orderBy(desc(parcels.createdAt)) : [];

        return results.map(r => ({
            ...r,
            farmer: r.farmer ? {
                ...r.farmer,
                parcels: allParcels.filter(p => p.farmerId === r.farmer!.id)
            } : null
        }));
    } else {
        const results = await db.select({
            id: connections.id,
            farmerId: connections.farmerId,
            companyId: connections.companyId,
            status: connections.status,
            initiatedBy: connections.initiatedBy,
            initialMessage: connections.initialMessage,
            createdAt: connections.createdAt,
            updatedAt: connections.updatedAt,
            company: companyProfiles,
        })
            .from(connections)
            .leftJoin(companyProfiles, eq(connections.companyId, companyProfiles.id))
            .where(and(
                eq(connections.farmerId, profileId),
                eq(connections.initiatedBy, "FARMER"),
                eq(connections.status, "PENDING")
            ));

        return results;
    }
}


