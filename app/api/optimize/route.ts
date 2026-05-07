import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    
    // Correctly import and instantiate based on the package's actual structure
    const sdk = await import("@qvac/sdk");
    const Qvac = sdk.QvacClient || sdk.default?.QvacClient || sdk.default || sdk.QvacEngine;
    
    if (!Qvac) throw new Error("QVAC SDK class not found in package");
    
    const engine = new Qvac();
    
    await engine.initialize();
    
    const response = await engine.chat(`Improve this job description: ${description}`);

    return NextResponse.json({ result: response.content });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
