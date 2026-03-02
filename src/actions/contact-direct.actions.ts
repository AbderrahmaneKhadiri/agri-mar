"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/persistence/db";
import { connections, messages, notifications, farmerProfiles, companyProfiles } from "@/persistence/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher";

/**
 * Initiates a direct message from the marketplace, bypassing the pending connection request.
 */
export async function initiateProductInquiryAction({
    farmerId,
    product
}: {
    farmerId: string,
    product: any
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) return { error: "Non authentifié" };
        if (session.user.role !== "COMPANY") return { error: "Seules les entreprises peuvent contacter les vendeurs" };

        // 1. Get Company Profile ID
        const companyProfile = await db.query.companyProfiles.findFirst({
            where: eq(companyProfiles.userId, session.user.id)
        });

        if (!companyProfile) return { error: "Profil entreprise introuvable" };

        // 2. Check for existing connection
        let connection = await db.query.connections.findFirst({
            where: and(
                eq(connections.farmerId, farmerId),
                eq(connections.companyId, companyProfile.id)
            )
        });

        let connectionId: string;

        if (!connection) {
            // Create New Accepted Connection
            const [newConn] = await db.insert(connections).values({
                farmerId,
                companyId: companyProfile.id,
                status: "ACCEPTED",
                initiatedBy: "COMPANY",
            }).returning();
            connectionId = newConn.id;
        } else {
            connectionId = connection.id;
            if (connection.status !== "ACCEPTED") {
                // Auto-accept if it was pending
                await db.update(connections)
                    .set({ status: "ACCEPTED", updatedAt: new Date() })
                    .where(eq(connections.id, connectionId));
            }

            // Check if inquiry already exists
            const existingInquiry = await db.query.messages.findFirst({
                where: and(
                    eq(messages.connectionId, connectionId),
                    eq(messages.type, "PRODUCT_INQUIRY")
                )
            });

            // If an inquiry exists, we check its metadata JSON. 
            // Drizzle JSON querying is complex, so we just fetch recent PRODUCT_INQUIRY 
            // messages and check them in memory to prevent spamming the exact same product.
            const previousInquiries = await db.query.messages.findMany({
                where: and(
                    eq(messages.connectionId, connectionId),
                    eq(messages.type, "PRODUCT_INQUIRY")
                )
            });

            const alreadyInquired = previousInquiries.some(msg =>
                msg.metadata && typeof msg.metadata === 'object' && 'productId' in msg.metadata && msg.metadata.productId === product.id
            );

            if (alreadyInquired) {
                return { success: true, connectionId }; // Skip creating duplicates
            }
        }

        // 3. Insert Product Inquiry Message
        const [newMessage] = await db.insert(messages).values({
            connectionId,
            senderUserId: session.user.id,
            content: `Demande d'information pour ${product.name}`,
            type: "PRODUCT_INQUIRY" as any,
            metadata: {
                productId: product.id,
                name: product.name,
                price: product.price,
                unit: product.unit,
                stock: product.stockQuantity,
                minOrder: product.minOrderQuantity,
                category: product.category,
                image: product.images?.[0] || null
            }
        }).returning();

        // 4. Trigger Pusher
        await pusherServer.trigger(`chat-${connectionId}`, "new-message", {
            ...newMessage,
            type: "PRODUCT_INQUIRY",
            sender: {
                id: session.user.id,
                name: session.user.name,
                image: session.user.image,
                role: session.user.role,
            }
        }).catch(e => console.error("Pusher error:", e));

        // 5. Create Notification for Farmer
        const farmerProfile = await db.query.farmerProfiles.findFirst({
            where: eq(farmerProfiles.id, farmerId)
        });

        if (farmerProfile?.userId) {
            const [newNotif] = await db.insert(notifications).values({
                userId: farmerProfile.userId,
                type: "NEW_MESSAGE",
                title: "Nouvelle demande produit",
                description: `${session.user.name} est intéressé par votre ${product.name}.`,
                link: "/dashboard/farmer/messages",
            }).returning();

            await pusherServer.trigger(`user-${farmerProfile.userId}`, "new-notification", newNotif).catch(() => { });
        }

        revalidatePath("/dashboard/company/messages");
        revalidatePath("/dashboard/farmer/messages");

        return { success: true, connectionId };

    } catch (error) {
        console.error("Error initiateProductInquiryAction:", error);
        return { error: "Erreur lors de l'initiation de la discussion" };
    }
}
