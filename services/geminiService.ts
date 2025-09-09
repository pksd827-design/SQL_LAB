import { GoogleGenAI } from "@google/genai";

// ⚠️ IMPORTANT FOR DEPLOYMENT
// Replace the placeholder below with your actual Google Gemini API key.
const API_KEY = 'YOUR_GOOGLE_GEMINI_API_KEY';

// --- SECURITY WARNING ---
// This method exposes your API key to anyone who views your website's source code.
// This is acceptable for personal projects or prototypes.
// For a public, production application, you should protect this key by using a
// backend proxy or a serverless function.
// --------------------

const ai = new GoogleGenAI({ apiKey: API_KEY! });

/**
 * Generates an SQL query from a natural language prompt using the Gemini API.
 * @param prompt The natural language prompt from the user.
 * @param schemaSql The SQL schema of the database.
 * @returns A promise that resolves to the generated SQL query string.
 */
export const generateSqlFromPrompt = async (prompt: string, schemaSql: string): Promise<string> => {
    if (API_KEY === 'YOUR_GOOGLE_GEMINI_API_KEY') {
        throw new Error("Gemini API key is not configured. Please add it in services/geminiService.ts");
    }

    // Per coding guidelines, use 'gemini-2.5-flash' for general text tasks.
    const model = 'gemini-2.5-flash';
    
    // Reverted to a simpler system instruction to improve reliability.
    const systemInstruction = `Given the following SQL schema, write a SQL query based on the user's request. Only return the raw SQL query itself.

Database Schema:
---
${schemaSql}
---
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        // Per coding guidelines, access the generated text directly via the .text property.
        const sqlQuery = response.text;
        
        // Clean up potential markdown code fences that the model might occasionally add.
        const cleanedQuery = sqlQuery.replace(/^```sql\n?|```$/g, '').trim();
        
        if (!cleanedQuery) {
            throw new Error("The model returned an empty query.");
        }

        return cleanedQuery;
    } catch (error) {
        console.error("Error generating SQL from Gemini:", error);
        if (error instanceof Error && error.message.includes('API key')) {
             throw new Error("Failed to generate SQL. The API key is invalid or missing.");
        }
        throw new Error("An error occurred while generating the SQL query.");
    }
};
