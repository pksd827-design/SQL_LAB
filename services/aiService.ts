/**
 * WARNING: THIS IS FOR DEVELOPMENT AND TESTING ONLY.
 * Your API key is exposed in the browser and can be stolen by anyone visiting the site.
 * For a real application, you MUST use a secure backend proxy (like a Netlify function)
 * to protect your key from being publicly accessible.
 */
const OPENROUTER_API_KEY = "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Generates an SQL query by calling the OpenRouter API directly from the browser.
 * @param prompt The natural language prompt from the user.
 * @param schemaSql The SQL schema of the database.
 * @returns A promise that resolves to the generated SQL query string.
 */
export const generateSqlFromPrompt = async (prompt: string, schemaSql: string): Promise<string> => {
    try {
        const systemMessage = `Given the following SQL schema, write a SQL query based on the user's request. Only return the raw SQL query itself. Do not include any explanations or markdown formatting like \`\`\`sql.

Database Schema:
---
${schemaSql}
---
`;

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                // Optional headers for OpenRouter analytics
                'HTTP-Referer': location.href,
                'X-Title': 'SQL Studio',
            },
            body: JSON.stringify({
                model: "nvidia/nemotron-nano-9b-v2",
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: prompt }
                ]
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const sqlQuery = data.choices?.[0]?.message?.content || '';

        if (!sqlQuery) {
            throw new Error("The model returned an empty query.");
        }
        
        // Clean up potential markdown formatting
        const cleanedQuery = sqlQuery.replace(/^```sql\n?|```$/g, '').trim();

        return cleanedQuery;

    } catch (error) {
        console.error("Error generating SQL from OpenRouter AI:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate SQL: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the SQL query.");
    }
};
