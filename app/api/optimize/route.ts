import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Ensure we are in Node.js environment
export const maxDuration = 60; // Increase timeout for Vercel Pro if available, otherwise it helps stabilize

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    
    // We import it inside the handler to prevent top-level build issues
    const { QvacEngine } = await import("@qvac/sdk");
    const engine = new QvacEngine();
    
    // For Serverless, we use a lighter initialization if possible or a quick response
    await engine.initialize();
    
    const prompt = `Expand and professionalize this job description for a freelance marketplace. Keep it structured. Description: ${description}`;
    const response = await engine.chat(prompt);

    return NextResponse.json({ result: response.content });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
