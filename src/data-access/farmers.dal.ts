import 'server-only'; // Assure que ce code ne "leak" jamais côté client
import { cache } from 'react';
import { getFarmerByIdFromDb, getFarmersFromDb, FarmerFilters } from '@/persistence/data-access/farmers.db';
// import { auth } from '@/lib/auth'; // Si on devait récupérer la session ici

/**
 * DTO (Data Transfer Object) pour la liste des agriculteurs.
 * Optimisé pour la petite carte de l'interface (Image 2).
 */
export type FarmerListDTO = {
    id: string;
    fullName: string;
    farmName: string;
    avatarUrl: string | null;
    region: string;
    city: string;
    mainCrops: string[];
    totalAreaHectares: string;
    certifications: string[];
    farmingMethods: string[];
    avgAnnualProduction: string;
};

/**
 * DAL: Récupère la liste des agriculteurs pour l'UI, avec cache React Server Components.
 */
export const getFarmersList = cache(async (filters?: FarmerFilters): Promise<FarmerListDTO[]> => {
    // 1. (Optionnel) Vérification de session si le catalogue est privé
    // const session = await auth.api.getSession({...});
    // if (!session) throw new Error("Unauthorized");

    // 2. Appel à la couche de persistance
    const farmers = await getFarmersFromDb(filters);

    // 3. Mapping vers un DTO strict (On retire les infos sensibles comme l'email, tel, etc.)
    return farmers.map((farmer) => ({
        id: farmer.id,
        fullName: farmer.fullName,
        farmName: farmer.farmName,
        avatarUrl: farmer.avatarUrl,
        region: farmer.region,
        city: farmer.city,
        mainCrops: farmer.cropTypes.slice(0, 3),
        totalAreaHectares: farmer.totalAreaHectares,
        certifications: farmer.certifications,
        farmingMethods: farmer.farmingMethods,
        avgAnnualProduction: farmer.avgAnnualProduction,
    }));
});

/**
 * DTO pour les détails complets (Partie droite de l'écran).
 */
export type FarmerDetailDTO = {
    id: string;
    fullName: string;
    farmName: string;
    avatarUrl: string | null;
    region: string;
    city: string;
    totalAreaHectares: string;
    certifications: string[];
    farmingMethods: string[];
    availableProductionVolume: string;
    isConnectionAccepted: boolean;
    contact?: {
        phone: string;
        businessEmail: string;
    };
};

import { checkConnectionStatus } from '@/persistence/data-access/connections.db';

/**
 * DAL: Récupère le détail d'un agriculteur. 
 * Masque les informations de contact si la connexion n'est pas établie.
 */
export const getFarmerDetails = cache(async (farmerId: string, companyId?: string): Promise<FarmerDetailDTO | null> => {
    const farmer = await getFarmerByIdFromDb(farmerId);
    if (!farmer) return null;

    let isConnectionAccepted = false;
    if (companyId) {
        const status = await checkConnectionStatus(farmerId, companyId);
        isConnectionAccepted = status === "ACCEPTED";
    }

    return {
        id: farmer.id,
        fullName: farmer.fullName,
        farmName: farmer.farmName,
        avatarUrl: farmer.avatarUrl,
        region: farmer.region,
        city: farmer.city,
        totalAreaHectares: farmer.totalAreaHectares,
        certifications: farmer.certifications,
        farmingMethods: farmer.farmingMethods,
        availableProductionVolume: farmer.availableProductionVolume,
        isConnectionAccepted,
        // On ne retourne les coordonnées QUE si la connexion est acceptée
        contact: isConnectionAccepted ? {
            phone: farmer.phone,
            businessEmail: farmer.businessEmail,
        } : undefined,
    };
});
