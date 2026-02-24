"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/persistence/db";
import { farmerProfiles } from "@/persistence/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
    createProduct,
    updateProduct,
    deleteProduct,
    getFarmerProducts,
    getMarketplaceProducts,
    ProductInsertDTO
} from "@/data-access/products.dal";

async function getFarmerId() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session?.user) throw new Error("Non authentifié");

    if (session.user.role !== "FARMER") throw new Error("Accès refusé. Réservé aux agriculteurs.");

    const profile = await db.query.farmerProfiles.findFirst({
        where: eq(farmerProfiles.userId, session.user.id)
    });

    if (!profile) throw new Error("Profil agriculteur introuvable");

    return profile.id;
}

export async function createProductAction(data: Omit<ProductInsertDTO, "id" | "farmerId" | "createdAt" | "updatedAt">) {
    try {
        const farmerId = await getFarmerId();
        const product = await createProduct({ ...data, farmerId });
        revalidatePath("/dashboard/farmer/products");
        revalidatePath("/dashboard/company/products");
        return { success: true, data: product };
    } catch (error: any) {
        console.error("createProductAction Error:", error);
        return { error: error.message || "Erreur lors de la création du produit" };
    }
}

export async function updateProductAction(productId: string, data: Partial<ProductInsertDTO>) {
    try {
        const farmerId = await getFarmerId();
        const updated = await updateProduct(productId, farmerId, data);
        if (!updated) return { error: "Produit non trouvé ou accès refusé" };

        revalidatePath("/dashboard/farmer/products");
        revalidatePath("/dashboard/company/products");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("updateProductAction Error:", error);
        return { error: error.message || "Erreur lors de la mise à jour du produit" };
    }
}

export async function deleteProductAction(productId: string) {
    try {
        const farmerId = await getFarmerId();
        const deleted = await deleteProduct(productId, farmerId);
        if (!deleted) return { error: "Produit non trouvé ou accès refusé" };

        revalidatePath("/dashboard/farmer/products");
        revalidatePath("/dashboard/company/products");
        return { success: true };
    } catch (error: any) {
        console.error("deleteProductAction Error:", error);
        return { error: error.message || "Erreur lors de la suppression du produit" };
    }
}

export async function getMyProductsAction() {
    try {
        const farmerId = await getFarmerId();
        return await getFarmerProducts(farmerId);
    } catch (error: any) {
        console.error("getMyProductsAction Error:", error);
        return [];
    }
}

export async function getMarketProductsAction(filters?: { category?: string, search?: string }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) throw new Error("Non authentifié");

        return await getMarketplaceProducts(filters);
    } catch (error: any) {
        console.error("getMarketProductsAction Error:", error);
        return [];
    }
}
