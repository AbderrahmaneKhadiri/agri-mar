import { z } from "zod";

export const connectionRequestSchema = z.object({
    targetId: z.string().uuid("L'ID cible doit être un UUID valide"),
});

export type ConnectionRequestInput = z.infer<typeof connectionRequestSchema>;

export const connectionResponseSchema = z.object({
    connectionId: z.string().uuid("L'ID de la connexion doit être un UUID valide"),
    response: z.enum(["ACCEPTED", "REJECTED"]),
});

export type ConnectionResponseInput = z.infer<typeof connectionResponseSchema>;
