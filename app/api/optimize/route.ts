import { NextResponse } from "next/server";
import { loadModel, LLAMA_3_2_1B_INST_Q4_0, completion, unloadModel } from "@qvac/sdk";

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    // Meaningful QVAC Integration on Server-side (Node.js)
    console.log("QVAC Server: Initializing Local LLM...");
    
    const modelId = await loadModel({
      modelSrc: LLAMA_3_2_1B_INST_Q4_0,
      modelType: "llm",
    });

    const history = [
      { 
        role: "user", 
        content: `Expand this into a professional job description for applicants: ${description}` 
      },
    ];

    const result = await completion({ modelId, history, stream: false });
    const aiResponse = result.answer || "Description generated locally.";

    await unloadModel({ modelId });

    return NextResponse.json({ result: aiResponse });

  } catch (error: any) {
    console.error("QVAC API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
