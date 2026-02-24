"use server";

import { revalidatePath } from "next/cache";
import { createConnectionRequest } from "@/services/connection.service";
import { respondToConnectionRequest } from "@/services/connection-respond.service";
import { ConnectionRequestInput, connectionRequestSchema, ConnectionResponseInput, connectionResponseSchema } from "@/lib/validations/connection.schema";
import { db } from "@/persistence/db";
import { connections } from "@/persistence/schema";
import { eq, or, and } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function requestConnectionAction(data: ConnectionRequestInput) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return { error: "Non authentifié" };

        const parsed = connectionRequestSchema.safeParse(data);
        if (!parsed.success) {
            return { error: "Requête invalide" };
        }

        const result = await createConnectionRequest(session.user.id, session.user.role as "ADMIN" | "FARMER" | "COMPANY", parsed.data);

        if (!result.success) {
            return { error: result.error };
        }

        revalidatePath("/dashboard/company/market");
        return { success: true, message: "Demande envoyée avec succès" };
    } catch (error) {
        return { error: "Une erreur inattendue est survenue" };
    }
}

export async function respondConnectionAction(data: ConnectionResponseInput) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return { error: "Non authentifié" };

        const parsed = connectionResponseSchema.safeParse(data);
        if (!parsed.success) {
            return { error: "Requête invalide" };
        }

        const result = await respondToConnectionRequest(session.user.id, session.user.role as "ADMIN" | "FARMER" | "COMPANY", parsed.data);

        if (!result.success) {
            return { error: result.error };
        }

        revalidatePath("/dashboard/farmer/requests");
        revalidatePath("/dashboard/company/suppliers");
        return { success: true, message: "Réponse enregistrée avec succès" };
    } catch (error) {
        return { error: "Une erreur inattendue est survenue" };
    }
}

export async function resignConnectionAction(connectionId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return { error: "Non authentifié" };

        // We delete the connection or set it to REJECTED? 
        // Typically resignation means removing the link.
        await db.delete(connections).where(eq(connections.id, connectionId));

        revalidatePath("/dashboard/farmer/partners");
        revalidatePath("/dashboard/company/suppliers");
        revalidatePath("/dashboard/company/messages");
        revalidatePath("/dashboard/farmer/messages");

        return { success: true };
    } catch (error) {
        console.error("resignConnectionAction Error:", error);
        return { error: "Erreur lors de la résiliation" };
    }
}
