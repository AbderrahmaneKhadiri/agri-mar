import { db } from "@/persistence/db";
import { reviews, user } from "@/persistence/schema";
import { eq, desc, avg, and, sql } from "drizzle-orm";

export const reviewRepository = {
    async findByRecipientId(recipientUserId: string) {
        return await db.query.reviews.findMany({
            where: eq(reviews.toUserId, recipientUserId),
            orderBy: [desc(reviews.createdAt)],
            with: {
                reviewer: true
            }
        });
    },

    async create(data: typeof reviews.$inferInsert) {
        const [result] = await db.insert(reviews).values(data).returning();
        return result;
    },

    async getAverageRating(userId: string) {
        const result = await db
            .select({
                average: avg(reviews.rating),
                count: sql<number>`count(*)`
            })
            .from(reviews)
            .where(eq(reviews.toUserId, userId));

        return result[0];
    }
};
