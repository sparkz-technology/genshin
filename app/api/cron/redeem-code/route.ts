import { processCodes } from "@/lib/action";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await processCodes()
    return NextResponse.json({ status: 200, message: "Processing codes..." });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
