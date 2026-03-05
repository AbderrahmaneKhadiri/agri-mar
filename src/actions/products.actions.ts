"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/persistence/db";
import { farmerProfiles, harvestPlans, products } from "@/persistence/schema";
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

export async function syncCatalogWithHarvestsAction() {
    try {
        const farmerId = await getFarmerId();

        // 1. Get all harvested plans for this farmer
        const harvestedPlans = await db.query.harvestPlans.findMany({
            where: eq(harvestPlans.farmerId, farmerId),
        });

        const completedHarvests = harvestedPlans.filter(h => h.status === "HARVESTED");

        if (completedHarvests.length === 0) {
            return { success: true, message: "Aucune récolte terminée à synchroniser." };
        }

        // 2. Get existing products names to avoid duplicates (naive check)
        const existingProducts = await db.query.products.findMany({
            where: eq(products.farmerId, farmerId),
        });
        const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase()));

        let addedCount = 0;

        for (const harvest of completedHarvests) {
            if (!existingNames.has(harvest.cropName.toLowerCase())) {
                await createProduct({
                    farmerId,
                    name: harvest.cropName,
                    description: `Récolte fraîche de ${harvest.cropName} (${harvest.variety || 'variété standard'}).`,
                    price: harvest.actualSalePrice || "0",
                    unit: harvest.unit || "KG",
                    stockQuantity: harvest.actualYield || "0",
                    category: "Légumes", // Default category, could be improved
                    status: "ACTIVE",
                    minOrderQuantity: "1",
                    images: []
                });
                addedCount++;
                existingNames.add(harvest.cropName.toLowerCase());
            }
        }

        revalidatePath("/dashboard/farmer?tab=products");
        return {
            success: true,
            message: addedCount > 0
                ? `${addedCount} produit(s) ajouté(s) au catalogue depuis vos récoltes.`
                : "Votre catalogue est déjà à jour avec vos récoltes."
        };
    } catch (error: any) {
        console.error("syncCatalogWithHarvestsAction Error:", error);
        return { error: error.message || "Erreur lors de la synchronisation" };
    }
}
