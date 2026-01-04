import { GoogleGenAI, Type } from "@google/genai";
import { ServiceProvider } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      contextDescription: { type: Type.STRING }
    },
    required: ["providerName", "phone"]
  }
};

export const searchWithAI = async (query: string, currentData: ServiceProvider[]) => {
  try {
    const context = JSON.stringify(currentData.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description
    })));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `CONTEXT: ${context}\nQUERY: ${query}\nTask: Answer in friendly Hebrew and provide JSON with {text, recommendedIds}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            recommendedIds: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["text", "recommendedIds"]
        }
      }
    });

    return JSON.parse(response.text || '{"text": "לא הצלחתי לעבד את התשובה", "recommendedIds": []}');
  } catch (error) {
    console.error("AI Search Error:", error);
    return { text: "שגיאה בחיבור לבינה המלאכותית.", recommendedIds: [] };
  }
};

export const magicParseRecommendation = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract recommendations from: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: EXTRACTION_SCHEMA
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Parse Error:", error);
    return [];
  }
};

export const parseWhatsAppImage = async (file: File) => {
  try {
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64 } },
          { text: "Extract service recommendations from this image." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: EXTRACTION_SCHEMA
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Image Parse Error:", error);
    return [];
  }
};