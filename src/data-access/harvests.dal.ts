import { db } from "@/persistence/db";
import { harvestPlans, harvestStatusEnum } from "@/persistence/schema";
import { eq, and, desc } from "drizzle-orm";

export type HarvestPlanInsertDTO = typeof harvestPlans.$inferInsert;
export type HarvestPlanSelectDTO = typeof harvestPlans.$inferSelect;

/**
 * Create a new harvest plan
 */
export async function createHarvestPlan(data: HarvestPlanInsertDTO) {
    const [created] = await db.insert(harvestPlans).values(data).returning();
    return created;
}

/**
 * Get all harvest plans for a specific farmer
 */
export async function getFarmerHarvestPlans(farmerId: string) {
    return await db.query.harvestPlans.findMany({
        where: eq(harvestPlans.farmerId, farmerId),
        orderBy: [desc(harvestPlans.plantingDate)],
        with: {
            expenses: true
        }
    });
}

/**
 * Update actual harvest data for margin calculation
 */
export async function updateHarvestActuals(id: string, farmerId: string, data: { actualYield: string; actualSalePrice: string; actualHarvestDate: Date }) {
    const [updated] = await db
        .update(harvestPlans)
        .set({
            ...data,
            status: "HARVESTED",
            updatedAt: new Date()
        })
        .where(and(eq(harvestPlans.id, id), eq(harvestPlans.farmerId, farmerId)))
        .returning();
    return updated;
}

/**
 * Update the status of a harvest plan
 */
export async function updateHarvestStatus(id: string, farmerId: string, status: typeof harvestStatusEnum.enumValues[number], actualHarvestDate?: Date) {
    const [updated] = await db
        .update(harvestPlans)
        .set({
            status,
            actualHarvestDate: actualHarvestDate || null,
            updatedAt: new Date()
        })
        .where(and(eq(harvestPlans.id, id), eq(harvestPlans.farmerId, farmerId)))
        .returning();
    return updated;
}

/**
 * Delete a harvest plan
 */
export async function deleteHarvestPlan(id: string, farmerId: string) {
    const [deleted] = await db
        .delete(harvestPlans)
        .where(and(eq(harvestPlans.id, id), eq(harvestPlans.farmerId, farmerId)))
        .returning();
    return deleted;
}
