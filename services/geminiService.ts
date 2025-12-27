
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini with the API key from environment variables as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProfessionalLetter = async (reason: string, type: string, days: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft a formal, concise college leave application letter. 
      Context: Student is applying for "${type}" leave for ${days} days.
      Key points from student: "${reason}".
      Tone: Academic, respectful, professional.
      Format: Only return the letter body, no placeholder headers like [Date] [Name].`,
      config: {
        temperature: 0.7,
        // Removed maxOutputTokens to prevent potential truncation issues with thinking tokens
      }
    });
    return response.text || "Failed to generate letter.";
  } catch (error) {
    console.error("Gemini Letter Generation Error:", error);
    return "Error generating AI letter. Please draft manually.";
  }
};

export const generateAdminSummary = async (reason: string, letter: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a college administrator assistant, summarize this student's leave request reason in ONE short sentence. 
      Reason: ${reason}
      Drafted Letter: ${letter}
      Focus on identifying the core necessity.`,
      config: {
        temperature: 0.3,
        // Removed maxOutputTokens to ensure the summary is complete
      }
    });
    return response.text || "Summary unavailable.";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "Summary error.";
  }
};
