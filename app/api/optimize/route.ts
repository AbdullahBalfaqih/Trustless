import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    
    // Import the functional API as per docs.qvac.tether.io
    const qvac = await import("@qvac/sdk");
    
    // We use the models found in the previous inspection
    const modelDescriptor = qvac.BERGAMOT_EN_AR || qvac.AFRICAN_4B_TRANSLATION_Q4_K_M;
    
    if (!qvac.loadModel || !qvac.completion) {
      throw new Error("QVAC Functional API (loadModel/completion) not found in package.");
    }

    console.log("QVAC: Loading model...");
    // 1. Load the model - Omit modelType to let SDK infer it automatically
    const modelId = await qvac.loadModel({ 
      modelSrc: qvac.LLAMA_3_2_1B_INST_Q4_0 || "llama-3-8b-instruct", 
      modelConfig: {} 
    });
    
    console.log("QVAC: Running completion...");
    // 2. Run completion
    const run = qvac.completion({
      modelId,
      history: [
        { role: "user", content: `Professionalize this job description: ${description}` }
      ]
    });

    const result = await run.final;
    
    return NextResponse.json({ result: result.content });
  } catch (error: any) {
    console.error("QVAC Server Error:", error);
    // If it fails due to memory/env constraints on Vercel, we report it clearly
    return NextResponse.json({ error: `QVAC Error: ${error.message}` }, { status: 500 });
  }
}
