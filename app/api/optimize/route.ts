import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    
    // Deep Subpath Discovery
    let sdk: any = null;
    try {
      sdk = await import("@qvac/sdk");
    } catch (e) {
      console.warn("Main import failed, trying subpaths...");
    }

    let Qvac: any = sdk?.QvacClient || sdk?.QvacEngine || sdk?.Client;

    if (!Qvac) {
      try {
        const clientSdk = await import("@qvac/sdk/client");
        Qvac = clientSdk.QvacClient || clientSdk.default?.QvacClient || clientSdk.default;
      } catch (e) {
        try {
          const distSdk = await import("@qvac/sdk/dist/index");
          Qvac = distSdk.QvacClient || distSdk.QvacEngine || distSdk.default;
        } catch (e2) {}
      }
    }

    if (!Qvac) {
      throw new Error(`Real AI Engine not found. Please ensure @qvac/sdk is installed correctly. Found keys: ${Object.keys(sdk || {}).slice(0, 5).join(", ")}`);
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
