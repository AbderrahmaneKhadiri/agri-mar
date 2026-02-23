import { db } from "@/persistence/db";
import { user } from "@/persistence/schema";
import { eq } from "drizzle-orm";

export const userRepository = {
    async findByEmail(email: string) {
        return await db.query.user.findFirst({
            where: eq(user.email, email),
        });
    },

    async findById(id: string) {
        return await db.query.user.findFirst({
            where: eq(user.id, id),
        });
    },

    async create(data: any) {
        const [result] = await db.insert(user).values(data).returning();
        return result;
    }
};
