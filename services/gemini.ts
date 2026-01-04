// services/gemini.ts
import { ServiceProvider } from "../types";

type SearchResult = { text: string; recommendedIds: string[] };

export const searchWithAI = async (
  query: string,
  currentData: ServiceProvider[]
): Promise<SearchResult> => {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "search", query, currentData }),
    });

    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as SearchResult;
  } catch (error) {
    console.error("AI Search Error:", error);
    return { text: "שגיאה בחיבור לבינה המלאכותית.", recommendedIds: [] };
  }
};

export const magicParseRecommendation = async (text: string) => {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "parseText", text }),
    });

    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error("AI Parse Error:", error);
    return [];
  }
};

export const parseWhatsAppImage = async (file: File) => {
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const s = reader.result as string;
        resolve(s.split(",")[1]);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "parseImage", base64, mimeType: file.type }),
    });

    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error("AI Image Parse Error:", error);
    return [];
  }
};
