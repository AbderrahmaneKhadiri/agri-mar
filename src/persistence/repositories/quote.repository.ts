import { db } from "@/persistence/db";
import { quotes, connections, farmerProfiles, companyProfiles, user } from "@/persistence/schema";
import { eq, and, desc } from "drizzle-orm";

export const quoteRepository = {
    async findById(id: string) {
        const results = await db.select({
            quote: quotes,
            connection: connections,
            farmer: farmerProfiles,
            company: companyProfiles,
            sender: user,
        })
            .from(quotes)
            .leftJoin(connections, eq(quotes.connectionId, connections.id))
            .leftJoin(farmerProfiles, eq(connections.farmerId, farmerProfiles.id))
            .leftJoin(companyProfiles, eq(connections.companyId, companyProfiles.id))
            .leftJoin(user, eq(quotes.senderUserId, user.id))
            .where(eq(quotes.id, id));

        if (results.length === 0) return null;

        const row = results[0];
        return {
            ...row.quote,
            sender: row.sender,
            connection: row.connection ? {
                ...row.connection,
                farmer: row.farmer,
                company: row.company
            } : null
        };
    },

    async findByConnectionId(connectionId: string) {
        return await db.select()
            .from(quotes)
            .where(eq(quotes.connectionId, connectionId))
            .orderBy(desc(quotes.createdAt));
    },

    async findBySenderUserId(userId: string) {
        const results = await db.select({
            quote: quotes,
            connection: connections,
            farmer: farmerProfiles,
            company: companyProfiles,
        })
            .from(quotes)
            .leftJoin(connections, eq(quotes.connectionId, connections.id))
            .leftJoin(farmerProfiles, eq(connections.farmerId, farmerProfiles.id))
            .leftJoin(companyProfiles, eq(connections.companyId, companyProfiles.id))
            .where(eq(quotes.senderUserId, userId))
            .orderBy(desc(quotes.createdAt));

        return results.map(row => ({
            ...row.quote,
            connection: row.connection ? {
                ...row.connection,
                farmer: row.farmer,
                company: row.company
            } : null
        }));
    },

    async findLatestPending(connectionId: string) {
        const results = await db.select()
            .from(quotes)
            .where(and(
                eq(quotes.connectionId, connectionId),
                eq(quotes.status, "PENDING")
            ))
            .orderBy(desc(quotes.createdAt))
            .limit(1);

        return results[0] || null;
    },

    async create(data: typeof quotes.$inferInsert) {
        const [result] = await db.insert(quotes).values(data).returning();
        return result;
    },

    async updateStatus(id: string, status: "ACCEPTED" | "DECLINED" | "NEGOTIATING") {
        const [result] = await db.update(quotes)
            .set({
                status,
                updatedAt: new Date()
            })
            .where(eq(quotes.id, id))
            .returning();
        return result;
    },

    async findNegotiationHistory(quoteId: string): Promise<any[]> {
        const history: any[] = [];
        let currentId: string | null = quoteId;

        while (currentId) {
            const results = await db.select({
                quote: quotes,
                sender: user,
            })
                .from(quotes)
                .leftJoin(user, eq(quotes.senderUserId, user.id))
                .where(eq(quotes.id, currentId));

            if (results.length === 0) break;

            const row = results[0];
            const q = { ...row.quote, sender: row.sender };
            history.push(q);
            currentId = row.quote.parentQuoteId;
        }

        return history.reverse(); // Chronological order
    }
};

