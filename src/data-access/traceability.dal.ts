import { cache } from "react";
import { db } from "@/persistence/db";
import { farmLogs, logActionTypeEnum } from "@/persistence/schema";
import { eq, desc, sql } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const getFarmLogs = cache(async (farmerId: string) => {
    try {
        const result = await db.execute(sql`SELECT * FROM farm_logs WHERE farmer_id = ${farmerId} ORDER BY date DESC`);
        return result.rows || [];
    } catch (e) {
        console.error("Direct SQL query failed:", e);
        return await db.query.farmLogs.findMany({
            where: eq(farmLogs.farmerId, farmerId),
            orderBy: [desc(farmLogs.date)],
            with: {
                parcel: true
            }
        });
    }
});

export const createLogEntry = async (data: any) => {
    return await db.insert(farmLogs).values(data).returning();
};

/**
 * Uses Gemini to parse a natural language string into structured logging data
 */
export const parseLogWithAI = async (text: string) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Tu es un assistant agricole expert en traçabilité. 
    Analyse la phrase suivante de l'agriculteur et extrait les données structurées au format JSON.
    Phrase : "${text}"

    Structure JSON attendue :
    {
        "actionType": "IRRIGATION" | "FERTILIZATION" | "TREATMENT" | "SOWING" | "HARVEST" | "MAINTENANCE" | "OTHER",
        "description": "Une description concise en français",
        "quantity": number | null,
        "unit": "L" | "m3" | "kg" | "tonne" | "sac" | null,
        "productUsed": "Nom du produit utilisé" | null
    }

    Règles :
    1. Si l'unité n'est pas claire, mets null.
    2. Si aucun produit n'est mentionné, mets null.
    3. Choisis l'actionType le plus proche.
    4. Réponds UNIQUEMENT avec le JSON, rien d'autre.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error parsing log with AI:", error);
        return null;
    }
};
