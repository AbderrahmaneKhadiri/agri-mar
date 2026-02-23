import { betterFetch } from "@better-fetch/fetch";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type Session = {
    user: {
        id: string;
        email: string;
        role: string;
    };
};

export default async function middleware(request: NextRequest) {
    // Routes qui nécessitent d'être connecté
    const protectedRoutes = ["/dashboard", "/profil"];
    const isProtectedRoute = protectedRoutes.some((route) =>
        request.nextUrl.pathname.startsWith(route)
    );

    // Si c'est une route protégée, on vérifie la session
    if (isProtectedRoute) {
        const { data: session } = await betterFetch<Session>(
            "/api/auth/get-session",
            {
                baseURL: request.nextUrl.origin,
                headers: {
                    cookie: request.headers.get("cookie") || "", // Transmet le cookie
                },
            }
        );

        if (!session) {
            // Rediriger vers la page de connexion si non authentifié
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Optionnel : Empêcher un utilisateur déjà connecté d'aller sur /login
    if (request.nextUrl.pathname === "/login") {
        const { data: session } = await betterFetch<Session>(
            "/api/auth/get-session",
            {
                baseURL: request.nextUrl.origin,
                headers: {
                    cookie: request.headers.get("cookie") || "",
                },
            }
        );
        if (session) {
            return NextResponse.redirect(new URL("/dashboard", request.url)); // Redirige vers le dashboard si déjà connecté
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
