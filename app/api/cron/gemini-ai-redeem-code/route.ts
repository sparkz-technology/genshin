import { NextResponse } from "next/server"

async function fetchGenshinCodes() {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return { success: false, error: "API key not configured" }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

    // Improved prompt that references specific websites and asks for current codes
    const prompt = `
      Find all currently active Genshin Impact redemption codes for the current month.
      
      Check these sources:
      1. Official Genshin Impact social media (Twitter/X, Facebook)
      2. HoYoLAB forums
      3. genshin.hoyoverse.com
      4. Genshin Impact wiki
      5. pockettactics.com/genshin-impact/codes
      6. gamespot.com (Genshin section)
      
      Return ONLY the actual redemption codes as a JSON array of strings.
      Each code should be exactly 12 characters long and consist of uppercase letters and numbers.
      If no active codes exist, return an empty array.
      
      Example response format: ["ABCD1234EFGH", "5678IJKL9012"]
    `

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more factual responses
        },
      }),
    })

    if (!response.ok) {
      return { success: false, error: `API request failed with status ${response.status}` }
    }

    const data = await response.json()

    // Extract AI response
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]"

    // Enhanced code extraction logic
    let codes: string[] = []

    // First try to parse as JSON
    try {
      const parsedData = JSON.parse(aiResponse)
      if (Array.isArray(parsedData)) {
        codes = parsedData.filter((code) => typeof code === "string" && /^[A-Z0-9]{12}$/.test(code))
      }
    } catch {
      // If JSON parsing fails, extract using regex
      const codeMatches = aiResponse.match(/[A-Z0-9]{12}/g)
      if (codeMatches) {
        // Remove duplicates
        codes = [...new Set(codeMatches)]
      }
    }

    // Get current date for reference
    const now = new Date()
    const currentMonth = now.toLocaleString("default", { month: "long" })
    const currentYear = now.getFullYear()

    return {
      success: true,
      codes,
      meta: {
        fetchedAt: now.toISOString(),
        month: currentMonth,
        year: currentYear,
      },
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function GET() {
  const result = await fetchGenshinCodes()

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(result, { status: 200 })
}

