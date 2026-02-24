import 'server-only';
import { cache } from 'react';
import {
    getIncomingConnectionsFromDb,
    getAcceptedPartnersFromDb,
    getOutgoingConnectionsFromDb
} from '@/persistence/data-access/connections.db';

export type PartnerDTO = {
    id: string;
    profileId: string;
    name: string;
    avatarUrl: string | null;
    industry?: string;
    role: "FARMER" | "COMPANY";
    since: Date;
    location: string;
    production?: string;
    // Expanded Farmer Details
    farmName?: string;
    phone?: string;
    email?: string;
    totalArea?: string;
    cropTypes?: string[];
    livestock?: string;
    certifications?: string[];
    farmingMethods?: string[];
    seasonality?: string[];
    exportCapacity?: boolean;
    logistics?: boolean;
};

export type IncomingRequestDTO = {
    id: string;
    senderName: string;
    senderLogo: string | null;
    senderIndustry?: string;
    senderRole: "FARMER" | "COMPANY";
    sentAt: Date;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    location?: string;
    production?: string;
    // Expanded Farmer Details
    farmName?: string;
    phone?: string;
    email?: string;
    totalArea?: string;
    cropTypes?: string[];
    livestock?: string;
    certifications?: string[];
    farmingMethods?: string[];
    seasonality?: string[];
    exportCapacity?: boolean;
    logistics?: boolean;
};

/**
 * DAL: Récupère les demandes entrantes pour un utilisateur.
 */
export const getIncomingRequests = cache(async (profileId: string, role: "FARMER" | "COMPANY"): Promise<IncomingRequestDTO[]> => {
    const rawRequests = await getIncomingConnectionsFromDb(profileId, role);

    return rawRequests.map((req) => {
        if (role === "FARMER") {
            const company = (req as any).company;
            return {
                id: req.id,
                senderName: company.companyName,
                senderLogo: company.logoUrl,
                senderIndustry: company.industry,
                senderRole: "COMPANY",
                sentAt: req.createdAt,
                status: req.status as any,
                location: company.city,
            };
        } else {
            const farmer = (req as any).farmer;
            return {
                id: req.id,
                senderName: farmer.fullName,
                senderLogo: farmer.avatarUrl,
                senderRole: "FARMER",
                sentAt: req.createdAt,
                status: req.status as any,
                location: `${farmer.city}, ${farmer.region}`,
                production: farmer.avgAnnualProduction,
                farmName: farmer.farmName,
                phone: farmer.phone,
                email: farmer.businessEmail,
                totalArea: farmer.totalAreaHectares,
                cropTypes: farmer.cropTypes,
                livestock: farmer.livestockType,
                certifications: farmer.certifications,
                farmingMethods: farmer.farmingMethods,
                seasonality: farmer.seasonAvailability,
                exportCapacity: farmer.exportCapacity,
                logistics: farmer.logisticsCapacity,
            };
        }
    });
});

/**
 * DAL: Récupère la liste des partenaires acceptés.
 */
export const getAcceptedPartners = cache(async (profileId: string, role: "FARMER" | "COMPANY"): Promise<PartnerDTO[]> => {
    const rawPartners = await getAcceptedPartnersFromDb(profileId, role);

    return rawPartners.map((conn) => {
        if (role === "FARMER") {
            const company = (conn as any).company;
            return {
                id: conn.id,
                profileId: company.id,
                name: company.companyName,
                avatarUrl: company.logoUrl,
                industry: company.industry,
                role: "COMPANY",
                since: conn.updatedAt,
                location: `${company.city}, ${company.country}`,
            };
        } else {
            const farmer = (conn as any).farmer;
            return {
                id: conn.id,
                profileId: farmer.id,
                name: farmer.fullName,
                avatarUrl: farmer.avatarUrl,
                role: "FARMER",
                since: conn.updatedAt,
                location: `${farmer.city}, ${farmer.region}`,
                production: farmer.avgAnnualProduction,
                farmName: farmer.farmName,
                phone: farmer.phone,
                email: farmer.businessEmail,
                totalArea: farmer.totalAreaHectares,
                cropTypes: farmer.cropTypes,
                livestock: farmer.livestockType,
                certifications: farmer.certifications,
                farmingMethods: farmer.farmingMethods,
                seasonality: farmer.seasonAvailability,
                exportCapacity: farmer.exportCapacity,
                logistics: farmer.logisticsCapacity,
            };
        }
    });
});

/**
 * DAL: Récupère les demandes sortantes pour un utilisateur.
 */
export const getOutgoingRequests = cache(async (profileId: string, role: "FARMER" | "COMPANY"): Promise<IncomingRequestDTO[]> => {
    const rawRequests = await getOutgoingConnectionsFromDb(profileId, role);

    return rawRequests.map((req) => {
        if (role === "COMPANY") {
            const farmer = (req as any).farmer;
            return {
                id: req.id,
                senderName: farmer.fullName,
                senderLogo: farmer.avatarUrl,
                senderRole: "FARMER",
                sentAt: req.createdAt,
                location: `${farmer.city}, ${farmer.region}`,
                production: farmer.avgAnnualProduction,
                farmName: farmer.farmName,
                phone: farmer.phone,
                email: farmer.businessEmail,
                totalArea: farmer.totalAreaHectares,
                cropTypes: farmer.cropTypes,
                livestock: farmer.livestockType,
                certifications: farmer.certifications,
                farmingMethods: farmer.farmingMethods,
                seasonality: farmer.seasonAvailability,
                exportCapacity: farmer.exportCapacity,
                logistics: farmer.logisticsCapacity,
            };
        } else {
            const company = (req as any).company;
            return {
                id: req.id,
                senderName: company.companyName,
                senderLogo: company.logoUrl,
                senderIndustry: company.industry,
                senderRole: "COMPANY",
                sentAt: req.createdAt,
            };
        }
    });
});

