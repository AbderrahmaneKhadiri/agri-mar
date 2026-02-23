import { db } from "@/persistence/db";
import { farmerProfiles } from "@/persistence/schema";
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
    let query = db.select().from(farmerProfiles).$dynamic();

    const conditions = [];

    if (filters?.search) {
        conditions.push(
            or(
                ilike(farmerProfiles.fullName, `%${filters.search}%`),
                ilike(farmerProfiles.farmName, `%${filters.search}%`)
            )
        );
    }

    if (filters?.region && filters.region !== "Toutes les régions") {
        conditions.push(eq(farmerProfiles.region, filters.region));
    }

    if (filters?.cropType && filters.cropType !== "Toutes les cultures") {
        // Pour JSONB, on vérifie si la valeur est contenue dans l'array
        conditions.push(sql`${farmerProfiles.cropTypes} @> ${JSON.stringify([filters.cropType])}::jsonb`);
    }

    if (conditions.length > 0) {
        query = query.where(and(...conditions));
    }

    return await query;
}

/**
 * RAW QUERY: Récupère un agriculteur par son ID.
 */
export async function getFarmerByIdFromDb(id: string) {
    return await db.query.farmerProfiles.findFirst({
        where: eq(farmerProfiles.id, id),
    });
}
