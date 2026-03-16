import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getFarmerAIContext } from "@/data-access/ai-advisor.dal";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "FARMER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, audio } = await req.json();
    const context = await getFarmerAIContext(session.user.id);

    if (!context) {
        return NextResponse.json({ error: "Profil agriculteur non trouvé" }, { status: 404 });
    }

    // Build the system prompt with context
    const systemPrompt = `
Vous êtes "AgriMar Advisor", un agronome virtuel expert pour la plateforme AgriMar. 
Votre mission est de donner des conseils précis, techniques et personnalisés à l'agriculteur en vous basant sur SES données réelles.

CONTEXTE DE L'AGRICULTEUR:
- Nom: ${context.profile.fullName}
- Exploitation: ${context.profile.farmName}
- Ville/Région: ${context.profile.city}, ${context.profile.region}
- Cultures principales: ${context.profile.cropTypes.join(", ")}
- Méthodes: ${context.profile.farmingMethods.join(", ")}
- Type d'irrigation: ${context.profile.irrigationType}

DONNÉES DES PARCELLES (AGROMONITORING):
${context.parcels.map(p => `
Parcelle: ${p.name} (${p.area} ha)
- NDVI actuel: ${p.realTimeData?.currentNDVI} (0.1=nu, 0.6+=sain)
- Humidité du sol: ${p.realTimeData?.soilMoisture} m3/m3
- Température du sol: ${p.realTimeData?.soilTemp}°C
- Météo actuelle: ${p.realTimeData?.currentWeather}, ${p.realTimeData?.temperature}°C
`).join("\n")}

CONSEILS SPÉCIFIQUES:
1. Soyez professionnel mais accessible.
2. Si le NDVI est bas (< 0.4), suggérez une inspection pour détecter des maladies ou un manque d'eau.
3. Si l'humidité du sol est basse, parlez de l'irrigation ${context.profile.irrigationType === "Goutte-à-Goutte" ? "en optimisant le goutte-à-goutte" : "à surveiller"}.
4. Répondez toujours en Français. Utilisez des termes agricoles marocains si appropriés (ex: Bour, Goutte-à-goutte).
5. Ne donnez jamais de conseils chimiques dangereux sans précaution.

Répondez de manière concise et structurée.
`;

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
        return NextResponse.json({ error: "Clé API Gemini manquante" }, { status: 500 });
    }

    // List of models to try in order (functional ones first)
    const modelsToTry = [
        "gemini-flash-latest",
        "gemini-pro-latest",
        "gemini-2.0-flash-lite"
    ];

    let lastError = null;

    for (const model of modelsToTry) {
        try {
            console.log(`[AI Advisor] Attempting with model: ${model}`);

            // Map common message roles to Gemini roles
            const contents = messages.map((m: any, index: number) => {
                const parts: any[] = [{ text: m.content }];

                // If it's the last message and we have audio, add the audio part
                if (index === messages.length - 1 && audio) {
                    parts.push({
                        inline_data: {
                            mime_type: "audio/webm",
                            data: audio
                        }
                    });
                }

                return {
                    role: m.role === "assistant" ? "model" : "user",
                    parts: parts
                };
            });

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                const errorData = JSON.parse(errorText);
                console.error(`[AI Advisor] Gemini API Error (${model}, ${response.status}):`, errorText);

                // If it's a 404 (model not found) or 429 (quota exceeded), try next model
                if (response.status === 404 || response.status === 429) {
                    lastError = { status: response.status, text: errorData?.error?.message || errorText };
                    continue;
                }

                return NextResponse.json({
                    error: `Erreur Gemini (${response.status})`,
                    details: errorText
                }, { status: response.status });
            }

            const data = await response.json();
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!aiResponse) {
                console.warn(`[AI Advisor] Empty response from model ${model}`);
                continue;
            }

            console.log(`[AI Advisor] Success with model: ${model}`);
            return NextResponse.json({ role: "assistant", content: aiResponse, modelUsed: model });

        } catch (err: any) {
            console.error(`[AI Advisor] Unexpected error with model ${model}:`, err);
            lastError = { status: 500, text: err.message };
            continue;
        }
    }

    return NextResponse.json({
        error: "Tous les modèles ont échoué",
        details: lastError?.text || "Erreur inconnue"
    }, { status: lastError?.status || 500 });
}
