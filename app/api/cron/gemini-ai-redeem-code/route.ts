import axios from "axios";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = "List all active Genshin Impact redeem codes for the current month as an array of strings. If no codes exist, return an empty array.";

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Extract AI response
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Convert AI response into an array
    let codes;
    try {
      codes = JSON.parse(aiResponse);
      if (!Array.isArray(codes)) throw new Error("Invalid response format");
    } catch {
      codes = [];
    }

    return codes;
  } catch (error) {
    console.error("Error fetching redeem codes:", error);
    return [];
  }
}
