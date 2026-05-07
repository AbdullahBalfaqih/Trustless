import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    
    // Automated Constructor Hunter
    const sdk = await import("@qvac/sdk");
    let Qvac: any = null;
    
    // 1. Check for known names
    Qvac = sdk.QvacClient || sdk.QvacEngine || sdk.Client || sdk.Engine;
    
    // 2. If not found, look for ANY function/class in the export list
    if (!Qvac) {
      const keys = Object.keys(sdk);
      for (const key of keys) {
        if (typeof (sdk as any)[key] === 'function' && /^[A-Z]/.test(key)) {
          Qvac = (sdk as any)[key];
          console.log(`Found potential constructor: ${key}`);
          break;
        }
      }
    }
    
    // 3. Fallback to default if it's a constructor
    if (!Qvac && typeof sdk.default === 'function') Qvac = sdk.default;

    if (!Qvac) {
      throw new Error(`Could not find a valid QVAC constructor. Available keys: ${Object.keys(sdk).slice(0, 10).join(", ")}...`);
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
