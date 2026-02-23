"use server";

import { registerUser } from "@/services/auth.service";
import { signUpSchema } from "@/lib/validations/auth.schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function signUpAction(prevState: any, formData: FormData) {
    // 1. Extraction des données
    const rawData = Object.fromEntries(formData);

    // 2. Validation de base (Zod)
    const validated = signUpSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: "Données invalides", details: validated.error.flatten().fieldErrors };
    }

    // 3. Appel du Service Layer
    // On passe les headers pour que le plugin nextCookies puisse définir les cookies dans la réponse
    const result = await registerUser(validated.data, await headers());

    if (!result.success) {
        return { error: result.error };
    }

    // 4. Succès -> Redirection vers l'Onboarding spécifique au rôle
    revalidatePath("/");
    const user = result.data;

    if (user?.role === "FARMER") {
        redirect("/onboarding/farmer");
    } else if (user?.role === "COMPANY") {
        redirect("/onboarding/company");
    }

    redirect("/dashboard");
}
