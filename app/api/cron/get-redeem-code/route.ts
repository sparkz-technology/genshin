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
import puppeteer from "puppeteer"
import { GoogleGenerativeAI } from "@google/generative-ai"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

async function fetchAllGenshinCodes(): Promise<void> {
  const genshinImpactRedeemCodeWebsitesDetails = await prisma.redeemCodeWebsite.findMany()
  for (const website of genshinImpactRedeemCodeWebsitesDetails) {
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
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 })

    await page.evaluate(() => {
      window.scrollBy(0, document.body.scrollHeight)
    })

    await page.waitForSelector(selector, { timeout: 30000 })

    const pageText = await page.evaluate(() => document.body.innerText)

    const codes = await getCodesFromGemini(pageText)

    await browser.close()
    return codes
  } catch (error) {
    console.error(`Error fetching codes from ${url}:`, error)
    await browser.close()
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
        website: true, // Include the website information if needed
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
    // First, fetch and process new codes
    await fetchAllGenshinCodes()

    // Then, get all codes from the database to return
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

