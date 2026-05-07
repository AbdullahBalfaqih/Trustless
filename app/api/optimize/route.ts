import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    
    // Deep inspection to find the correct constructor
    const sdk = await import("@qvac/sdk");
    console.log("QVAC SDK Keys:", Object.keys(sdk));
    
    // Try to find the constructor among common patterns
    let Qvac = sdk.QvacClient || sdk.QvacEngine || (typeof sdk.default === 'function' ? sdk.default : sdk.default?.QvacClient);
    
    if (!Qvac && typeof sdk === 'function') Qvac = sdk;
    
    if (!Qvac) {
      throw new Error(`QVAC SDK structure unknown. Keys: ${Object.keys(sdk).join(", ")}`);
    }
    
    const engine = new Qvac();
    
    await engine.initialize();
    
    const response = await engine.chat(`Improve this job description: ${description}`);

    return NextResponse.json({ result: response.content });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
