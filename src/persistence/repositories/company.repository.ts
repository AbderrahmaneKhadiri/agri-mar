import { db } from "@/persistence/db";
import { companyProfiles } from "@/persistence/schema";
import { eq } from "drizzle-orm";

export const companyRepository = {
    async findByUserId(userId: string) {
        return await db.query.companyProfiles.findFirst({
            where: eq(companyProfiles.userId, userId),
        });
    },

    async create(data: any) {
        const [result] = await db.insert(companyProfiles).values(data).returning();
        return result;
    },

    async update(id: string, data: Partial<typeof companyProfiles.$inferInsert>) {
        const [result] = await db.update(companyProfiles)
            .set(data)
            .where(eq(companyProfiles.id, id))
            .returning();
        return result;
    }
};
