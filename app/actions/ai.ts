"use server"

import { 
  loadModel, 
  completion, 
  LLAMA_3_2_1B_INST_Q4_0,
} from "@qvac/sdk";

/**
 * Sovereign AI Engine (Stable RPC Edition)
 * Updated to handle timeouts and ensure the engine starts correctly.
 */

let engineModelId: string | null = null;

export async function PolishWithSovereignAI(description: string) {
  try {
    console.log("🚀 Starting QVAC Sovereign Engine...");

    // 1. Force a timeout limit for model loading to catch hangs early
    const loadPromise = (async () => {
      if (!engineModelId) {
        engineModelId = await loadModel({
          modelSrc: LLAMA_3_2_1B_INST_Q4_0,
          modelType: "llm",
        });
      }
      return engineModelId;
    })();

    // Timeout guard for 60 seconds (loading 1.5GB can be slow)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Model loading timed out. Check your GPU/RAM.")), 60000)
    );

    const modelId = await Promise.race([loadPromise, timeoutPromise]) as string;

    console.log("🧠 Reasoning...");

    // 2. Perform Inference
    const result = await completion({
      modelId: modelId,
      history: [
        {
          role: "user",
          content: `Professionalize this job description. Improve tone and structure while keeping the core details: \n\n${description}`,
        },
      ],
    });

    // 3. Extract Result
    const finalResult = (result as any).final ? await (result as any).final : result;
    const content = typeof finalResult === "string" 
      ? finalResult 
      : finalResult?.content || finalResult?.text || finalResult;

    return {
      success: true,
      content: content
    };

  } catch (error: any) {
    console.error("❌ QVAC Error:", error);
    
    // If it's an RPC timeout, it might be due to a previous crashed process
    // Clearing the cached ID to force a fresh start next time
    engineModelId = null;

    return {
      success: false,
      error: error?.message || "Sovereign Engine is busy or initializing. Please try again in a moment."
    };
  }
}
