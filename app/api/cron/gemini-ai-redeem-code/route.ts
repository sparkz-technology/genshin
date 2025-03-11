import { NextResponse } from 'next/server';

// Define types for the response data
interface GenshinCode {
  code: string;
  source: string;
  region?: string;
}

interface SuccessResponse {
  success: true;
  codes: GenshinCode[];
  meta: {
    fetchedAt: string;
    month: string;
    year: number;
    totalCodes: number;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

// Define types for the Gemini API response
interface GeminiResponsePart {
  text: string;
}

interface GeminiResponseContent {
  parts: GeminiResponsePart[];
}

interface GeminiResponseCandidate {
  content: GeminiResponseContent;
}

interface GeminiResponse {
  candidates?: GeminiResponseCandidate[];
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: "API key not configured" 
      } as ErrorResponse);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Generate prompt dynamically
    const currentMonth = new Date().toLocaleString("default", { month: "long" });
    const currentYear = new Date().getFullYear();

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
      
      4. Format your response ONLY as a valid JSON array with no additional text:
      [
        {"code": "ABCD1234EFGH", "source": "Official Twitter"},
        {"code": "5678IJKL9012", "source": "HoYoLAB forums", "region": "Global"}
      ]
      
      IMPORTANT: Your response must be ONLY the JSON array with no additional text, explanations, or formatting.
    `;

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
    });

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: `API request failed with status ${response.status}` 
      } as ErrorResponse);
    }

    const data: GeminiResponse = await response.json();

    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const codeMatches = aiResponse.match(/[A-Z0-9]{12}/g) || [];
    const uniqueCodes = [...new Set(codeMatches)];

    let codes: GenshinCode[] = [];

    try {
      // @ts-ignore
      const jsonMatch = aiResponse.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsedData)) {
          codes = parsedData.filter(
            (item): item is GenshinCode =>
              typeof item === "object" &&
              item !== null &&
              "code" in item &&
              "source" in item &&
              typeof item.code === "string" &&
              /^[A-Z0-9]{12}$/.test(item.code) &&
              typeof item.source === "string"
          );
        }
      }
    } catch (error) {
      console.error("Error parsing JSON from AI response:", error);
      // Fallback to just the codes without source info
      codes = uniqueCodes.map((code) => ({ code, source: "Unknown" }));
    }

    // If we couldn't extract structured data but found codes, use them
    if (codes.length === 0 && uniqueCodes.length > 0) {
      codes = uniqueCodes.map((code) => ({ code, source: "Unknown" }));
    }

    const successResponse: SuccessResponse = {
      success: true,
      codes,
      meta: {
        fetchedAt: new Date().toISOString(),
        month: currentMonth,
        year: currentYear,
        totalCodes: codes.length,
      },
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("API error:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    } as ErrorResponse);
  }
}
