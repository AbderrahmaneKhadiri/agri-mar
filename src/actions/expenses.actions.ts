"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createExpense, deleteExpense, getFarmerExpenses } from "@/data-access/expenses.dal";
import { z } from "zod";

const expenseSchema = z.object({
    harvestPlanId: z.string().uuid().optional().nullable(),
    category: z.enum(["INPUTS", "LABOR", "FUEL", "LOGISTICS", "OTHERS"]),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Le montant doit être un nombre positif",
    }),
    description: z.string().optional(),
    date: z.date().default(() => new Date()),
});

export async function createExpenseAction(formData: any) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "FARMER") {
        throw new Error("Unauthorized");
    }

    // Get farmer profile (assuming we have a way to get it or farmerId is known)
    // For simplicity, we assume we need to fetch the farmer profile first or pass it.
    // In this app, we usually have the farmer profile id from the session or a previous fetch.
    // Let's use a repository to find the farmer profile by userId.
    const { farmerRepository } = await import("@/persistence/repositories/farmer.repository");
    const profile = await farmerRepository.findByUserId(session.user.id);

    if (!profile) throw new Error("Farmer profile not found");

    const validated = expenseSchema.parse(formData);

    await createExpense({
        farmerId: profile.id,
        harvestPlanId: validated.harvestPlanId || null,
        category: validated.category,
        amount: validated.amount,
        description: validated.description,
        date: validated.date,
    });

    revalidatePath("/dashboard");
}

export async function deleteExpenseAction(id: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "FARMER") {
        throw new Error("Unauthorized");
    }

    const { farmerRepository } = await import("@/persistence/repositories/farmer.repository");
    const profile = await farmerRepository.findByUserId(session.user.id);
    if (!profile) throw new Error("Farmer profile not found");

    await deleteExpense(id, profile.id);
    revalidatePath("/dashboard");
}

export async function getExpensesAction() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || session.user.role !== "FARMER") {
        throw new Error("Unauthorized");
    }

    const { farmerRepository } = await import("@/persistence/repositories/farmer.repository");
    const profile = await farmerRepository.findByUserId(session.user.id);
    if (!profile) throw new Error("Farmer profile not found");

    return await getFarmerExpenses(profile.id);
}
