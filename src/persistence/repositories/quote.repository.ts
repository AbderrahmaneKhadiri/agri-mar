import { db } from "@/persistence/db";
import { quotes } from "@/persistence/schema";
import { eq, and, desc } from "drizzle-orm";

export const quoteRepository = {
    async findById(id: string) {
        return await db.query.quotes.findFirst({
            where: eq(quotes.id, id),
            with: {
                sender: true,
                connection: {
                    with: {
                        farmer: true,
                        company: true
                    }
                }
            }
        });
    },

    async findByConnectionId(connectionId: string) {
        return await db.query.quotes.findMany({
            where: eq(quotes.connectionId, connectionId),
            orderBy: [desc(quotes.createdAt)]
        });
    },

    async findLatestPending(connectionId: string) {
        return await db.query.quotes.findFirst({
            where: and(
                eq(quotes.connectionId, connectionId),
                eq(quotes.status, "PENDING")
            ),
            orderBy: [desc(quotes.createdAt)]
        });
    },

    async create(data: typeof quotes.$inferInsert) {
        const [result] = await db.insert(quotes).values(data).returning();
        return result;
    },

    async updateStatus(id: string, status: "ACCEPTED" | "DECLINED") {
        const [result] = await db.update(quotes)
            .set({
                status,
                updatedAt: new Date()
            })
            .where(eq(quotes.id, id))
            .returning();
        return result;
    }
};
