// import puppeteer from "puppeteer";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import prisma from "@/lib/prisma";
// import { NextResponse } from "next/server";

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;



// async function fetchAllGenshinCodes(): Promise<void> {
//   const genshinImpactRedeemCodeWebsitesDetails = await prisma.redeemCodeWebsite.findMany();
//   for (const website of genshinImpactRedeemCodeWebsitesDetails) {
//     const codes = await fetchGenshinCodes(website.url, website.selector);
//     await Promise.all(
//       codes.map((code: string) =>
//         prisma.redeemCode.upsert({
//           where: { code: code },
//           update: {},
//           create: { code: code, websiteId: website.id },
//         })
//       )
//     );
//   }
// }

// async function fetchGenshinCodes(url: string, selector: string): Promise<string[]> {
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();

//   try {
//     await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

//     await page.evaluate(() => {
//       window.scrollBy(0, document.body.scrollHeight);
//     });

//     await page.waitForSelector(selector, { timeout: 30000 });

//     const pageText = await page.evaluate(() => document.body.innerText);

//     const codes = await getCodesFromGemini(pageText);

//     await browser.close();
//     return codes;
//   } catch (error) {
//     console.error(`Error fetching codes from ${url}:`, error);
//     await browser.close();
//     return [];
//   }
// }

// async function getCodesFromGemini(text: string): Promise<string[]> {
//   try {
//     const genAI = new GoogleGenerativeAI(GEMINI_API_KEY as string);
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//     const prompt = `Extract valid Genshin Impact redeem codes from this text. 
//     The codes are alphanumeric, 8-16 characters long, and may include hyphens. 
//     Return only the codes in a JavaScript array format. Do not include expired codes.
    
//     Here is the extracted text:\n\n${text}`;

//     const result = await model.generateContent(prompt);
//     const responseText = await result.response.text();

//     const match = responseText.match(/\[.*?\]/s);
//     if (match) {
//       return JSON.parse(match[0]) as string[];
//     }

//     return [];
//   } catch (error) {
//     console.error("Gemini AI processing error:", error);
//     return [];
//   }
// }

// export async function GET(): Promise<NextResponse> {
//   try {
//     fetchAllGenshinCodes();
//     return NextResponse.json({ status: 200, message: "Processing codes..." });
//   } catch (error) {
//     console.error("Processing error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
import chromium from "chrome-aws-lambda"
import puppeteerCore from "puppeteer-core"
import { GoogleGenerativeAI } from "@google/generative-ai"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

/**
 * Fetch all Genshin Impact redeem codes from various websites and store them in the database.
 */
async function fetchAllGenshinCodes(): Promise<void> {
  try {
    const websites = await prisma.redeemCodeWebsite.findMany()

    for (const website of websites) {
      const codes = await fetchGenshinCodes(website.url, website.selector)

      if (codes.length > 0) {
        await prisma.redeemCode.createMany({
          data: codes.map(code => ({
            code,
            websiteId: website.id,
          })),
          skipDuplicates: true, // Avoid inserting duplicate codes
        })
      }
    }
  } catch (error) {
    console.error("Error fetching all Genshin codes:", error)
  }
}

/**
 * Fetch Genshin Impact redeem codes from a given website using Puppeteer.
 */
async function fetchGenshinCodes(url: string, selector: string): Promise<string[]> {
  let browser
  try {
    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath || "/usr/bin/chromium",
      headless: true,
      ignoreHTTPSErrors: true,
    })

    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 })

    await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight))
    await page.waitForSelector(selector, { timeout: 30000 })

    const pageText = await page.evaluate(() => document.body.innerText)
    return await getCodesFromGemini(pageText)
  } catch (error) {
    console.error(`Error fetching codes from ${url}:`, error)
    return []
  } finally {
    if (browser) await browser.close() // Ensures browser is always closed
  }
}

/**
 * Extract redeem codes from text using Gemini AI.
 */
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

    // Extract valid JSON array from response
    const match = responseText.match(/\[.*?\]/s)
    return match ? JSON.parse(match[0]) : []
  } catch (error) {
    console.error("Gemini AI processing error:", error)
    return []
  }
}

/**
 * Retrieve stored redeem codes from the database.
 */
async function getStoredCodes() {
  try {
    return await prisma.redeemCode.findMany({ include: { website: true } })
  } catch (error) {
    console.error("Error fetching codes from database:", error)
    throw error
  }
}

/**
 * API route handler for GET requests.
 */
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
