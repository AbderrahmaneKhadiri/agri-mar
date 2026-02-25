"use server";

import { farmerRepository } from "@/persistence/repositories/farmer.repository";

export async function getFarmerProfileByIdAction(id: string) {
    try {
        const profile = await farmerRepository.findById(id);
        if (!profile) return { error: "Profil non trouvé" };

        return {
            success: true,
            data: {
                id: profile.id,
                name: profile.fullName,
                avatarUrl: profile.avatarUrl,
                location: `${profile.city}, ${profile.region}`,
                farmName: profile.farmName,
                phone: profile.phone,
                email: profile.businessEmail,
                totalArea: profile.totalAreaHectares,
                cropTypes: profile.cropTypes,
                livestock: profile.livestockType || undefined,
                certifications: profile.certifications,
                farmingMethods: profile.farmingMethods,
                seasonality: profile.seasonAvailability,
                exportCapacity: profile.exportCapacity,
                logistics: profile.logisticsCapacity,
                iceNumber: profile.iceNumber,
                onssaCert: profile.onssaCert,
                irrigationType: profile.irrigationType,
                hasColdStorage: profile.hasColdStorage,
                deliveryCapacity: profile.deliveryCapacity,
                businessModel: profile.businessModel,
                longTermContractAvailable: profile.longTermContractAvailable,
                production: profile.availableProductionVolume,
            }
        };
    } catch (error: any) {
        console.error("getFarmerProfileByIdAction Error:", error);
        return { error: "Erreur lors de la récupération du profil" };
    }
}
