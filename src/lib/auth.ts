import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/persistence/db";
import * as schema from "@/persistence/schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    emailVerification: {
        sendOnSignUp: false,
    },
    advanced: {
        useSecureCookies: process.env.NODE_ENV === "production",
    },
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || "",
        "https://agri-mar-s97y.vercel.app"
    ],
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "FARMER"
            }
        }
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },
    plugins: [
        nextCookies()
    ]
});
