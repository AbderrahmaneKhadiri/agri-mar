import { z } from "zod";

export const farmerProfileSchema = z.object({
    fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    farmName: z.string().min(2, "Le nom de l'exploitation est requis"),
    avatarUrl: z.string().url().optional().or(z.literal("")),
    city: z.string().min(2, "La ville est requise"),
    region: z.string().min(2, "La région est requise"),
    phone: z.string().min(8, "Numéro de téléphone invalide"),
    businessEmail: z.string().email("Email invalide"),

    totalAreaHectares: z.number().positive("La superficie doit être positive").or(z.string().transform(Number)),
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
});

export type FarmerProfileInput = z.infer<typeof farmerProfileSchema>;
