import { db } from "@/persistence/db";
import { notifications } from "@/persistence/schema";
import { eq, desc } from "drizzle-orm";

type NotificationInsertDTO = typeof notifications.$inferInsert;

export async function createNotification(data: NotificationInsertDTO) {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
}

export async function getUserNotifications(userId: string) {
    return db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        orderBy: [desc(notifications.createdAt)],
    });
}

export async function markNotificationAsRead(id: string) {
    const [updated] = await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .returning();
    return updated;
}
