import { NextResponse } from "next/server"

async function processCodes() {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error("API key not configured")
      return
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
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Extract AI response
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]"

    // Convert AI response into an array
    let codes
    try {
      // Try to parse the response as JSON
      codes = JSON.parse(aiResponse)
      if (!Array.isArray(codes)) {
        // If it's not an array, try to extract codes using regex
        const codeMatches = aiResponse.match(/[A-Z0-9]{12}/g)
        codes = codeMatches || []
      }
    } catch {
      // If parsing fails, check if the response contains codes in a different format
      const codeMatches = aiResponse.match(/[A-Z0-9]{12}/g)
      codes = codeMatches || []
    }

    console.log("Fetched codes:", codes)
    // Here you would typically store or process the codes further
  } catch (error) {
    console.error("Error in processCodes:", error)
  }
}

export async function GET() {
  try {
    // Start processing codes asynchronously
    processCodes()

    // Return immediate response
    return NextResponse.json({ status: 200, message: "Processing codes..." })
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

