import { NextResponse } from "next/server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

const BASE_PROMPT =
  "You are a professional nutritionist. Analyze this meal photo and estimate its nutritional content. " +
  "Return ONLY a raw JSON object with NO markdown, NO code block, NO explanation — just the JSON: " +
  '{"name":"<dish name in French>","calories":<integer kcal>,"proteines":<integer grams>,"glucides":<integer grams>,"lipides":<integer grams>}';

interface AnalysisResult {
  name: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message: string; code: number };
}

function extractJSON(raw: string): AnalysisResult {
  const stripped = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end === -1) {
    console.error("[Gemini] Réponse brute :", raw);
    throw new Error(`Réponse non parseable : "${stripped.slice(0, 300)}"`);
  }

  const parsed = JSON.parse(stripped.slice(start, end + 1)) as Partial<AnalysisResult>;

  return {
    name: String(parsed.name ?? "Repas inconnu"),
    calories: Math.round(Number(parsed.calories)) || 0,
    proteines: Math.round(Number(parsed.proteines)) || 0,
    glucides: Math.round(Number(parsed.glucides)) || 0,
    lipides: Math.round(Number(parsed.lipides)) || 0,
  };
}

export async function POST(request: Request) {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Clé API Gemini manquante (GEMINI_API_KEY)" },
      { status: 500 }
    );
  }

  let imageB64: string;
  let notes: string;

  try {
    const body = await request.json();
    imageB64 = body.imageB64;
    notes = body.notes ?? "";
    if (!imageB64 || typeof imageB64 !== "string") {
      return NextResponse.json({ error: "Image manquante" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const prompt = notes?.trim()
    ? `${BASE_PROMPT} Additional context: "${notes.trim()}"`
    : BASE_PROMPT;

  const mimeType = imageB64.startsWith("/9j/")
    ? "image/jpeg"
    : imageB64.startsWith("iVBOR")
      ? "image/png"
      : imageB64.startsWith("R0lGOD")
        ? "image/gif"
        : imageB64.startsWith("UklGR")
          ? "image/webp"
          : "image/jpeg";

  try {
    const res = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: imageB64 } },
            ],
          },
        ],
        generationConfig: { temperature: 0 },
      }),
    });

    const data: GeminiResponse = await res.json();

    if (data.error) {
      console.error("[Gemini API error]", data.error);
      return NextResponse.json(
        { error: `Erreur Gemini ${data.error.code} : ${data.error.message}` },
        { status: 502 }
      );
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error("[Gemini] Réponse vide :", JSON.stringify(data));
      return NextResponse.json(
        { error: "Réponse vide — essaie avec une photo plus nette" },
        { status: 502 }
      );
    }

    return NextResponse.json(extractJSON(rawText));
  } catch (error) {
    console.error("[Analyse backend]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}
