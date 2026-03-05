import { db } from "@/persistence/db";
import { farmerProfiles, farmerPhotos, parcels } from "@/persistence/schema";
import { eq, desc } from "drizzle-orm";

export const farmerRepository = {
    async findByUserId(userId: string) {
        return await db.query.farmerProfiles.findFirst({
            where: eq(farmerProfiles.userId, userId),
        });
    },

    async findById(id: string) {
        return await db.query.farmerProfiles.findFirst({
            where: eq(farmerProfiles.id, id),
        });
    },

    async create(data: any) {
        const [result] = await db.insert(farmerProfiles).values(data).returning();
        return result;
    },

    async update(id: string, data: Partial<typeof farmerProfiles.$inferInsert>) {
        const [result] = await db.update(farmerProfiles)
            .set(data)
            .where(eq(farmerProfiles.id, id))
            .returning();
        return result;
    },

    async createParcel(farmerId: string, geoJson: string, area: string, polygonId: string) {
        const parsedGeoJson = JSON.parse(geoJson);
        const [result] = await db.insert(parcels).values({
            farmerId,
            name: "Parcelle Principale",
            polygonId: polygonId,
            area: area,
            geoJson: parsedGeoJson
        }).returning();
        return result;
    },

    async getParcelById(id: string) {
        return await db.query.parcels.findFirst({
            where: eq(parcels.id, id),
        });
    },

    async updateParcel(id: string, data: Partial<typeof parcels.$inferInsert>) {
        const [result] = await db.update(parcels)
            .set(data)
            .where(eq(parcels.id, id))
            .returning();
        return result;
    },

    async getParcelsByFarmerId(farmerId: string) {
        return await db.query.parcels.findMany({
            where: eq(parcels.farmerId, farmerId),
            orderBy: [desc(parcels.createdAt)],
        });
    },

    async getPhotos(farmerProfileId: string) {
        return await db.query.farmerPhotos.findMany({
            where: eq(farmerPhotos.farmerProfileId, farmerProfileId),
            orderBy: [desc(farmerPhotos.createdAt)],
        });
    },

    async addPhoto(data: typeof farmerPhotos.$inferInsert) {
        const [result] = await db.insert(farmerPhotos).values(data).returning();
        return result;
    },

    async deletePhoto(photoId: string) {
        await db.delete(farmerPhotos).where(eq(farmerPhotos.id, photoId));
    },

    async getLatest(limit: number = 3) {
        return await db.query.farmerProfiles.findMany({
            orderBy: [desc(farmerProfiles.createdAt)],
            limit: limit,
        });
    }
};
