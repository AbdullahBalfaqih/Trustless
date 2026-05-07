import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    
    // Importing inside the handler to keep it server-only
    const { QvacEngine } = await import("@qvac/sdk");
    const engine = new QvacEngine();
    
    await engine.initialize();
    
    const response = await engine.chat(`Improve this job description: ${description}`);

    return NextResponse.json({ result: response.content });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
