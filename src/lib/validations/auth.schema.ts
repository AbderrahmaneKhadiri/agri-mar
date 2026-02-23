import { z } from "zod";

export const signUpSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères"),
    name: z.string().min(2, "Le nom est trop court"),
    role: z.enum(["FARMER", "COMPANY"]),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
