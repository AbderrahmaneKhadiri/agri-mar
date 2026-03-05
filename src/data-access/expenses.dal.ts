import { db } from "@/persistence/db";
import { expenses, expenseCategoryEnum } from "@/persistence/schema";
import { eq, and, desc, sum } from "drizzle-orm";

export type ExpenseInsertDTO = typeof expenses.$inferInsert;
export type ExpenseSelectDTO = typeof expenses.$inferSelect;

/**
 * Create a new expense
 */
export async function createExpense(data: ExpenseInsertDTO) {
    const [created] = await db.insert(expenses).values(data).returning();
    return created;
}

/**
 * Get all expenses for a specific farmer
 */
export async function getFarmerExpenses(farmerId: string) {
    return await db.query.expenses.findMany({
        where: eq(expenses.farmerId, farmerId),
        orderBy: [desc(expenses.date)],
        with: {
            harvestPlan: true
        }
    });
}

/**
 * Get total expenses for a specific harvest plan
 */
export async function getHarvestPlanExpensesTotal(harvestPlanId: string) {
    const result = await db
        .select({ total: sum(expenses.amount) })
        .from(expenses)
        .where(eq(expenses.harvestPlanId, harvestPlanId));

    return Number(result[0].total || 0);
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string, farmerId: string) {
    const [deleted] = await db
        .delete(expenses)
        .where(and(eq(expenses.id, id), eq(expenses.farmerId, farmerId)))
        .returning();
    return deleted;
}
