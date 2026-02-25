import { z } from "zod";

export const farmerProfileSchema = z.object({
    fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    farmName: z.string().min(2, "Le nom de l'exploitation est requis"),
    avatarUrl: z.string().url().optional().or(z.literal("")),
    city: z.string().min(2, "La ville est requise"),
    region: z.string().min(2, "La région est requise"),
    phone: z.string().min(8, "Numéro de téléphone invalide"),
    businessEmail: z.string().email("Email invalide").optional().or(z.literal("")),

    totalAreaHectares: z.union([z.string(), z.number()]).optional().transform(val => val ? String(val) : "0"),
    cropTypes: z.array(z.string()).default([]),
    livestockType: z.string().optional(),
    avgAnnualProduction: z.string().default("Non spécifié"),
    certifications: z.array(z.string()).default([]),
    farmingMethods: z.array(z.string()).default([]),

    availableProductionVolume: z.string().default("Non spécifié"),
    seasonAvailability: z.array(z.string()).default([]),
    exportCapacity: z.boolean().default(false),
    logisticsCapacity: z.boolean().default(false),
    longTermContractAvailable: z.boolean().default(false),

    // Qualification B2B
    iceNumber: z.string().optional().or(z.literal("")),
    onssaCert: z.string().optional().or(z.literal("")),
    irrigationType: z.string().optional(), // Goutte-à-Goutte / Bour
    hasColdStorage: z.boolean().default(false),
    deliveryCapacity: z.boolean().default(false),
    businessModel: z.array(z.string()).default(["Direct Sales"]), // Direct Sales, Contracts
});

export type FarmerProfileInput = z.infer<typeof farmerProfileSchema>;
