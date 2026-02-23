import { auth } from "@/lib/auth";
import { defineAbilityFor } from "@/lib/casl";
import { signUpSchema, SignUpInput } from "@/lib/validations/auth.schema";
import { userRepository } from "@/persistence/repositories/user.repository";

export async function registerUser(input: SignUpInput, headers?: Headers) {
    try {
        // 1. Authorization (AuthZ - RBAC) - Diagram: isAuthorized (rbac)
        // Note: L'inscription est publique, donc on autorise tout le monde (Guest)
        // Pour les autres services, on utiliserait: ability.can('create', 'Subject')

        // 2. Service Validation (Zod) - Diagram: Service Validation (Zod)
        const validated = signUpSchema.safeParse(input);
        if (!validated.success) {
            return { success: false, error: "Validation failed", details: validated.error.flatten() };
        }

        // 3. Data Sanitize - Diagram: Data Sanitize (zod)
        const { email, password, name, role } = validated.data;
        const sanitizedEmail = email.toLowerCase().trim();

        // 4. Business Logic - Diagram: Business Logic
        const existingUser = await userRepository.findByEmail(sanitizedEmail);
        if (existingUser) {
            return { success: false, error: "Cet email est déjà utilisé." };
        }

        // 5. Authentication System Integration (AuthN) - Diagram: Authentication (AuthN)
        try {
            const signupResult = await auth.api.signUpEmail({
                body: {
                    email: sanitizedEmail,
                    password,
                    name,
                    role,
                },
                headers
            });

            // Note: En mode Server Action, signUpEmail ne définit pas toujours les cookies de session.
            // On retourne succès, et c'est l'action qui pourra gérer la suite si besoin.
            return { success: true, data: signupResult.user };
        } catch (authError: any) {
            console.error("Better-Auth error:", authError);
            return { success: false, error: authError.message || "Erreur lors de l'inscription" };
        }

    } catch (error) {
        console.error("registerUser Service Error:", error);
        return { success: false, error: "Erreur serveur interne" };
    }
}
