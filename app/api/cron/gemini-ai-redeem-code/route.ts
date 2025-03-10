import { NextResponse } from "next/server"

async function fetchGenshinCodes() {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return { success: false, error: "API key not configured" }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

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
                text: "List all active Genshin Impact redeem codes for the current month as an array of strings. If no codes exist, return an empty array.",
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      return { success: false, error: `API request failed with status ${response.status}` }
    }

    const data = await response.json()

    // Extract AI response
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]"

    // Convert AI response into an array
    let codes
    try {
      codes = JSON.parse(aiResponse)
      if (!Array.isArray(codes)) {
        // If it's not an array, extract codes using regex
        const codeMatches = aiResponse.match(/[A-Z0-9]{12}/g)
        codes = codeMatches || []
      }
    } catch {
      // Handle non-JSON formatted responses
      const codeMatches = aiResponse.match(/[A-Z0-9]{12}/g)
      codes = codeMatches || []
    }

    return { success: true, codes }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function GET() {
  const result = await fetchGenshinCodes()

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ status: 200, codes: result.codes })
}
