import { db } from "@/persistence/db";
import { farmerProfiles, parcels } from "@/persistence/schema";
import { and, eq, ilike, or, sql } from "drizzle-orm";

export interface FarmerFilters {
    search?: string;
    region?: string;
    cropType?: string;
}

/**
 * RAW QUERY: Récupère la liste des agriculteurs avec filtres optionnels.
 */
export async function getFarmersFromDb(filters?: FarmerFilters) {
    let query = db.select({
        profile: farmerProfiles,
        parcel: parcels
    })
        .from(farmerProfiles)
        .leftJoin(parcels, eq(farmerProfiles.id, parcels.farmerId))
        .$dynamic();

    const conditions = [];

    if (filters?.search) {
        conditions.push(
            or(
                ilike(farmerProfiles.fullName, `%${filters.search}%`),
                ilike(farmerProfiles.farmName, `%${filters.search}%`)
            )
        );
    }

    if (filters?.region && filters.region !== "all") {
        conditions.push(eq(farmerProfiles.region, filters.region));
    }

    if (filters?.cropType && filters.cropType !== "all") {
        conditions.push(sql`${farmerProfiles.cropTypes} @> ${JSON.stringify([filters.cropType])}::jsonb`);
    }

    if (conditions.length > 0) {
        query = query.where(and(...conditions));
    }

    const results = await query;

    // S'assurer qu'on ne retourne qu'un seul profil par fermier (même s'il a plusieurs parcelles)
    const uniqueFarmers = new Map();
    results.forEach(row => {
        if (!uniqueFarmers.has(row.profile.id)) {
            uniqueFarmers.set(row.profile.id, {
                ...row.profile,
                parcelPolygonId: row.parcel?.polygonId
            });
        }
    });

    return Array.from(uniqueFarmers.values());
}

/**
 * RAW QUERY: Récupère un agriculteur par son ID avec sa parcelle.
 */
export async function getFarmerByIdFromDb(id: string) {
    const [result] = await db.select({
        profile: farmerProfiles,
        parcel: parcels
    })
        .from(farmerProfiles)
        .leftJoin(parcels, eq(farmerProfiles.id, parcels.farmerId))
        .where(eq(farmerProfiles.id, id))
        .limit(1);

    if (!result) return null;

    return {
        ...result.profile,
        parcelPolygonId: result.parcel?.polygonId
    };
}
