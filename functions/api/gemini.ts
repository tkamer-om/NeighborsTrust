// functions/api/gemini.ts
import { GoogleGenAI, Type } from "@google/genai";

const EXTRACTION_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      providerName: { type: Type.STRING },
      category: { type: Type.STRING },
      phone: { type: Type.STRING },
      comment: { type: Type.STRING },
      recommenderName: { type: Type.STRING },
      contextDescription: { type: Type.STRING },
    },
    required: ["providerName", "phone"],
  },
};

type RequestBody =
  | { action: "search"; query: string; currentData: any[] }
  | { action: "parseText"; text: string }
  | { action: "parseImage"; base64: string; mimeType: string };

export const onRequestPost: PagesFunction = async (ctx) => {
  try {
    const apiKey = ctx.env.GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const body = (await ctx.request.json()) as RequestBody;

    if (body.action === "search") {
      const { query, currentData } = body;

      const context = JSON.stringify(
        (currentData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
        }))
      );

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `CONTEXT: ${context}\nQUERY: ${query}\nTask: Answer in friendly Hebrew and provide JSON with {text, recommendedIds}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              recommendedIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["text", "recommendedIds"],
          },
        },
      });

      return new Response(response.text ?? `{"text":"","recommendedIds":[]}`, {
        headers: { "content-type": "application/json" },
      });
    }

    if (body.action === "parseText") {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract recommendations from: ${body.text}`,
        config: { responseMimeType: "application/json", responseSchema: EXTRACTION_SCHEMA },
      });

      return new Response(response.text ?? "[]", {
        headers: { "content-type": "application/json" },
      });
    }

    if (body.action === "parseImage") {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { mimeType: body.mimeType, data: body.base64 } },
            { text: "Extract service recommendations from this image." },
          ],
        },
        config: { responseMimeType: "application/json", responseSchema: EXTRACTION_SCHEMA },
      });

      return new Response(response.text ?? "[]", {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
