import { db } from "@/persistence/db";
import { notifications } from "@/persistence/schema";
import { eq, and, desc } from "drizzle-orm";

export const notificationRepository = {
    async findByUserId(userId: string, limit = 20) {
        return await db.query.notifications.findMany({
            where: eq(notifications.userId, userId),
            orderBy: [desc(notifications.createdAt)],
            limit: limit
        });
    },

    async countUnread(userId: string) {
        const result = await db.query.notifications.findMany({
            where: and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            )
        });
        return result.length;
    },

    async create(data: typeof notifications.$inferInsert) {
        const [result] = await db.insert(notifications).values(data).returning();
        return result;
    },

    async markAsRead(id: string) {
        const [result] = await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, id))
            .returning();
        return result;
    },

    async markAllAsRead(userId: string) {
        return await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId))
            .returning();
    }
};
