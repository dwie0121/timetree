
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Parses a natural language string into a structured calendar event using Gemini.
 * Uses gemini-3-flash-preview for basic text parsing tasks.
 * Re-initializes GoogleGenAI inside the function to ensure current API key usage.
 */
export async function parseEventFromNaturalLanguage(prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following text into a calendar event. Use today's date (${new Date().toISOString()}) as a reference if no specific year is provided.
      
      Text: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING, description: "ISO format YYYY-MM-DD" },
            startTime: { type: Type.STRING, description: "24h format HH:mm" },
            endTime: { type: Type.STRING, description: "24h format HH:mm" },
            category: { 
              type: Type.STRING, 
              description: "The category of the event",
            },
            description: { type: Type.STRING }
          },
          required: ["title", "date", "category"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
}
