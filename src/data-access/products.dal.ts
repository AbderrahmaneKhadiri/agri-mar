import { db } from "@/persistence/db";
import { products, farmerProfiles } from "@/persistence/schema";
import { eq, and, desc, sql, ilike } from "drizzle-orm";

export type ProductInsertDTO = typeof products.$inferInsert;
export type ProductSelectDTO = typeof products.$inferSelect;

export async function createProduct(data: ProductInsertDTO) {
    const [created] = await db.insert(products).values(data).returning();
    return created;
}

export async function updateProduct(id: string, farmerId: string, data: Partial<ProductInsertDTO>) {
    const [updated] = await db.update(products)
        .set({ ...data, updatedAt: new Date() })
        .where(
            and(
                eq(products.id, id),
                eq(products.farmerId, farmerId) // Ensure ownership
            )
        )
        .returning();
    return updated;
}

export async function deleteProduct(id: string, farmerId: string) {
    const [deleted] = await db.delete(products)
        .where(
            and(
                eq(products.id, id),
                eq(products.farmerId, farmerId)
            )
        )
        .returning();
    return deleted;
}

export async function getFarmerProducts(farmerId: string) {
    return db.query.products.findMany({
        where: eq(products.farmerId, farmerId),
        orderBy: [desc(products.createdAt)]
    });
}

export async function getMarketplaceProducts(filters?: { category?: string, search?: string }) {
    const conditions = [eq(products.status, "ACTIVE")];

    if (filters?.category && filters.category !== "Toutes") {
        conditions.push(eq(products.category, filters.category));
    }

    if (filters?.search) {
        conditions.push(ilike(products.name, `%${filters.search}%`));
    }

    return db.query.products.findMany({
        where: and(...conditions),
        orderBy: [desc(products.createdAt)],
        with: {
            farmer: true
        }
    });
}

export async function getProductById(id: string) {
    return db.query.products.findFirst({
        where: eq(products.id, id),
        with: {
            farmer: true
        }
    });
}

/**
 * Returns top 5 cities by number of active products on the market.
 */
export async function getTopCitiesFromMarket(): Promise<{ city: string; count: number }[]> {
    const result = await db
        .select({
            city: farmerProfiles.city,
            count: sql<number>`cast(count(${products.id}) as int)`
        })
        .from(products)
        .innerJoin(farmerProfiles, eq(products.farmerId, farmerProfiles.id))
        .where(eq(products.status, "ACTIVE"))
        .groupBy(farmerProfiles.city)
        .orderBy(desc(sql`count(${products.id})`))
        .limit(5);

    return result.filter(r => r.city !== null) as { city: string; count: number }[];
}

/**
 * Returns the number of products grouped by day for the last 7 days,
 * split by ACTIVE vs SOLD_OUT. Used for the stacked bar chart on the company dashboard.
 */
export async function getMarketChartData(): Promise<{ date: string; actives: number; epuisees: number }[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Fetch all relevant products created in the last 7 days
    const recentProducts = await db.query.products.findMany({
        where: and(
            sql`${products.createdAt} >= ${sevenDaysAgo}`,
            sql`${products.status} IN ('ACTIVE', 'SOLD_OUT')`
        ),
        columns: {
            createdAt: true,
            status: true
        }
    });

    // Initialize map for the last 7 days with local timezone grouping
    const map: Record<string, { actives: number; epuisees: number }> = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        // Format to YYYY-MM-DD locally to match what the client expects
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        map[key] = { actives: 0, epuisees: 0 };
    }

    // Aggregate data using local dates to avoid mismatches
    for (const product of recentProducts) {
        const d = new Date(product.createdAt);
        const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        if (map[day]) {
            if (product.status === "ACTIVE") map[day].actives += 1;
            else if (product.status === "SOLD_OUT") map[day].epuisees += 1;
        }
    }

    return Object.entries(map).map(([date, counts]) => ({ date, ...counts }));
}
