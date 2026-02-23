import { db } from "@/persistence/db";
import { quotes, connections } from "@/persistence/schema";
import { eq, and, sql, desc } from "drizzle-orm";

/**
 * Get monthly revenue for the last 6 months
 * Based on ACCEPTED quotes
 */
export async function getMonthlyRevenue(farmerProfileId: string) {
    const rawRevenue = await db
        .select({
            month: sql<string>`TO_CHAR(created_at, 'Mon')`,
            monthNum: sql<number>`EXTRACT(MONTH FROM created_at)`,
            total: sql<number>`SUM(CAST(total_amount AS DECIMAL))`,
        })
        .from(quotes)
        .where(
            and(
                eq(quotes.status, "ACCEPTED"),
                // Only quotes sent by this farmer
                sql`${quotes.connectionId} IN (
                    SELECT id FROM ${connections} WHERE farmer_id = ${farmerProfileId}
                )`
            )
        )
        .groupBy(sql`TO_CHAR(created_at, 'Mon')`, sql`EXTRACT(MONTH FROM created_at)`)
        .orderBy(sql`EXTRACT(MONTH FROM created_at)`);

    return rawRevenue.map(row => ({
        name: row.month,
        revenue: Number(row.total || 0),
    }));
}

/**
 * Get conversion stats (Ratio of accepted vs total)
 */
export async function getQuoteStats(farmerProfileId: string) {
    const stats = await db
        .select({
            status: quotes.status,
            count: sql<number>`count(*)`,
        })
        .from(quotes)
        .where(
            sql`${quotes.connectionId} IN (
                SELECT id FROM ${connections} WHERE farmer_id = ${farmerProfileId}
            )`
        )
        .groupBy(quotes.status);

    return stats;
}

/**
 * Get recent commercial activity feed
 */
export async function getRecentCommercialActivity(farmerProfileId: string, limit = 5) {
    return await db
        .select()
        .from(quotes)
        .where(
            sql`${quotes.connectionId} IN (
                SELECT id FROM ${connections} WHERE farmer_id = ${farmerProfileId}
            )`
        )
        .orderBy(desc(quotes.updatedAt))
        .limit(limit);
}
