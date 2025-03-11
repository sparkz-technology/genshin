import { NextResponse } from "next/server"

// Define types for the API response
interface GenshinCode {
  code: string
  source: string
  region?: string
}

interface ApiResponse {
  success: boolean
  codes?: GenshinCode[]
  error?: string
  meta?: {
    fetchedAt: string
    month: string
    year: number
    totalCodes: number
  }
}

// Function to fetch Genshin Impact redemption codes
async function fetchGenshinCodes(): Promise<ApiResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY as string

    if (!apiKey) {
      return { success: false, error: "API key not configured" }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

    // Generate prompt dynamically
    const currentMonth = new Date().toLocaleString("default", { month: "long" })
    const currentYear = new Date().getFullYear()

    const prompt = `
      Find all currently active Genshin Impact redemption codes for ${currentMonth} ${currentYear}.
      
      Follow these steps:
      1. Check these official sources:
         - Official Genshin Impact Twitter (@GenshinImpact)
         - Official Genshin Impact Facebook page
         - Official Genshin Impact Discord announcements
         - HoYoLAB official forums (https://www.hoyolab.com/official/1)
         - genshin.hoyoverse.com (official website)
      
      2. Verify codes on these reliable third-party sources:
         - Genshin Impact wiki (https://genshin-impact.fandom.com/wiki/Promotional_Code)
         - pockettactics.com/genshin-impact/codes
         - gamespot.com (Genshin Impact section)
         - progameguides.com/genshin-impact/genshin-impact-codes/
      
      3. Ensure the codes:
         - Are exactly 12 characters (uppercase letters and numbers)
         - Are not expired
         - Are valid for this month (${currentMonth} ${currentYear})
      
      4. Format response as a JSON array:
      [
        {"code": "ABCD1234EFGH", "source": "Official Twitter"},
        {"code": "5678IJKL9012", "source": "HoYoLAB forums", "region": "Global"}
      ]
    `

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          topK: 40,
        },
      }),
    })

    if (!response.ok) {
      return { success: false, error: `API request failed with status ${response.status}` }
    }

    const data = await response.json()

    // Extract AI response safely
    const aiResponse: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]"

    let codes: GenshinCode[] = []

    try {
      const parsedData = JSON.parse(aiResponse)
      if (Array.isArray(parsedData)) {
        codes = parsedData.filter(
          (item: any): item is GenshinCode =>
            typeof item === "object" &&
            typeof item.code === "string" &&
            /^[A-Z0-9]{12}$/.test(item.code) &&
            typeof item.source === "string"
        )
      }
    } catch (error) {
      console.error("Error parsing AI response:", error)
      const codeMatches = aiResponse.match(/[A-Z0-9]{12}/g)
      if (codeMatches) {
        codes = [...new Set(codeMatches)].map((code) => ({ code, source: "Unknown" }))
      }
    }

    return {
      success: true,
      codes,
      meta: {
        fetchedAt: new Date().toISOString(),
        month: currentMonth,
        year: currentYear,
        totalCodes: codes.length,
      },
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Next.js API route handler
export async function GET() {
  const result = await fetchGenshinCodes()

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(result, { status: 200 })
}
