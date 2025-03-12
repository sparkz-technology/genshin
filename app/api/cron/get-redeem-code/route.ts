import axios from "axios"
import * as cheerio from "cheerio"
import { GoogleGenerativeAI } from "@google/generative-ai"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

async function fetchAllGenshinCodes(): Promise<void> {
  const websites = await prisma.redeemCodeWebsite.findMany()

  for (const website of websites) {
    const codes = await fetchGenshinCodes(website.url, website.selector)

    await Promise.all(
      codes.map((code: string) =>
        prisma.redeemCode.upsert({
          where: { code: code },
          update: {},
          create: { code: code, websiteId: website.id },
        }),
      ),
    )
  }
}

async function fetchGenshinCodes(url: string, selector: string): Promise<string[]> {
  try {
    // Send request with headers to mimic a real browser
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    })

    const $ = cheerio.load(data)

    // Get the text content of the specified selector
    const pageText = $(selector).text()

    // Extract codes using Gemini AI
    const codes = await getCodesFromGemini(pageText)

    return codes
  } catch (error) {
    console.error(`Error fetching codes from ${url}:`, error)
    return []
  }
}

async function getCodesFromGemini(text: string): Promise<string[]> {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY as string)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `Extract valid Genshin Impact redeem codes from this text. 
    The codes are alphanumeric, 8-16 characters long, and may include hyphens. 
    Return only the codes in a JavaScript array format. Do not include expired codes.
    
    Here is the extracted text:\n\n${text}`

    const result = await model.generateContent(prompt)
    const responseText = await result.response.text()

    const match = responseText.match(/\[.*?\]/s)
    if (match) {
      return JSON.parse(match[0]) as string[]
    }

    return []
  } catch (error) {
    console.error("Gemini AI processing error:", error)
    return []
  }
}

async function getStoredCodes() {
  try {
    // Fetch all codes from the database
    const codes = await prisma.redeemCode.findMany({
      include: {
        website: true, // Include website details
      },
    })
    return codes
  } catch (error) {
    console.error("Error fetching codes from database:", error)
    throw error
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    await fetchAllGenshinCodes()
    const savedCodes = await getStoredCodes()

    return NextResponse.json({
      status: 200,
      message: "Codes processed successfully",
      data: savedCodes,
    })
  } catch (error) {
    console.error("Processing error:", error)
    return NextResponse.json(
      {
        status: 500,
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
