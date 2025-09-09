// OpenRouter API endpoint
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// Your site's URL and name for OpenRouter analytics (optional but recommended)
const SITE_URL = "https://sql-studio.netlify.app"; // Replace with your actual site URL
const SITE_NAME = "SQL Studio";

exports.handler = async function (event) {
  // We only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt, schemaSql } = JSON.parse(event.body);
    
    // IMPORTANT: The API key should be set as an environment variable in your Netlify settings.
    // The key name should be OPENROUTER_API_KEY.
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "OPENROUTER_API_KEY is not configured on the server." }) };
    }

    // System message to guide the AI
    const systemMessage = `Given the following SQL schema, write a SQL query based on the user's request. Only return the raw SQL query itself. Do not include any explanations or markdown formatting like \`\`\`sql.

Database Schema:
---
${schemaSql}
---
`;

    // Construct the request payload for the OpenRouter (OpenAI compatible) API
    const requestBody = {
      model: "nvidia/nemotron-nano-9b-v2", // The model user requested
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ]
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter API Error:", errorData);
        const errorMessage = errorData?.error?.message || "Failed to call OpenRouter API";
        return { statusCode: response.status, body: JSON.stringify({ error: errorMessage }) };
    }

    const data = await response.json();
    
    // Extract the text from the response
    const sqlQuery = data.choices?.[0]?.message?.content || '';
    
    // Clean up potential markdown formatting
    const cleanedQuery = sqlQuery.replace(/^```sql\n?|```$/g, '').trim();

    return {
      statusCode: 200,
      body: JSON.stringify({ sql: cleanedQuery }),
    };

  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};