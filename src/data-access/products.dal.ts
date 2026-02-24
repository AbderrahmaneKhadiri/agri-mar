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
            farmer: {
                columns: {
                    id: true,
                    userId: true,
                    fullName: true,
                    farmName: true,
                    avatarUrl: true,
                    city: true,
                    region: true
                }
            }
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
