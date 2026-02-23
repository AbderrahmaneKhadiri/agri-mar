import { z } from "zod";

export const companyProfileSchema = z.object({
    companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
    logoUrl: z.string().url().optional().or(z.literal("")),
    industry: z.string().min(2, "Le secteur d'activité est requis"),
    establishedYear: z.number().int().min(1900, "Année invalide").max(new Date().getFullYear(), "L'année ne peut pas être dans le futur").or(z.string().transform(Number)),
    city: z.string().min(2, "La ville est requise"),
    country: z.string().default("Maroc"),
    phone: z.string().min(8, "Numéro de téléphone invalide"),
    businessEmail: z.string().email("Email invalide"),
    website: z.string().url("URL de site web invalide").optional().or(z.literal("")),

    desiredProducts: z.array(z.string()).default([]),
    avgDesiredQuantity: z.string().default("Non spécifiée"),
    targetRegions: z.array(z.string()).default([]),
    partnershipType: z.string().default("Non spécifié"),

    marketType: z.enum(["LOCAL", "INTERNATIONAL", "BOTH"]).default("LOCAL"),
    exportCountries: z.array(z.string()).default([]),
    requiredCertifications: z.array(z.string()).default([]),
    purchasingCapacity: z.string().default("Non spécifiée"),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
