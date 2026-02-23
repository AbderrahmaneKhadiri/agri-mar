import { db } from "@/persistence/db";
import { farmerProfiles } from "@/persistence/schema";
import { eq } from "drizzle-orm";

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
    }
};
