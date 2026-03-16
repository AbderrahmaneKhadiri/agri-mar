"use server";

import { createLogEntry, parseLogWithAI } from "@/data-access/traceability.dal";
import { revalidatePath } from "next/cache";

export async function parseLogAction(text: string) {
    try {
        const result = await parseLogWithAI(text);
        return { data: result, success: true };
    } catch (error) {
        console.error("Action error parsing log:", error);
        return { success: false, error: "Failed to parse log" };
    }
}

export async function createLogAction(data: any) {
    try {
        const result = await createLogEntry(data);
        revalidatePath("/dashboard/farmer");
        return { data: result, success: true };
    } catch (error) {
        console.error("Action error creating log:", error);
        return { success: false, error: "Failed to create log" };
    }
}
