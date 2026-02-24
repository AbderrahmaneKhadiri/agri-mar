import { db } from "@/persistence/db";
import { farmerProfiles, farmerPhotos } from "@/persistence/schema";
import { eq, desc } from "drizzle-orm";

export const farmerRepository = {
    async findByUserId(userId: string) {
        return await db.query.farmerProfiles.findFirst({
            where: eq(farmerProfiles.userId, userId),
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
