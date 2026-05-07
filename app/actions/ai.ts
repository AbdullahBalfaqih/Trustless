"use server"

import { 
  loadModel, 
  completion, 
  LLAMA_3_2_1B_INST_Q4_0,
  unloadModel
} from "@qvac/sdk";

/**
 * Sovereign AI Engine (Server-Side Node Execution)
 * This is the ONLY stable way to run QVAC natively within Next.js.
 * Since you run this locally, it is 100% "On-Device" Sovereign AI.
 */

let cachedModelId: string | null = null;

export async function optimizeJobDescription(description: string) {
  try {
    // 1. Initialize Model if not cached
    if (!cachedModelId) {
      cachedModelId = await loadModel({
        modelSrc: LLAMA_3_2_1B_INST_Q4_0,
        modelType: "llm",
      });
    }

    // 2. Perform Inference
    const result = await completion({
      modelId: cachedModelId!,
      history: [
        {
          role: "user",
          content: `Professionalize and structure this job description: ${description}`,
        },
      ],
    });

    // 3. Extract Result
    const finalResult = (result as any).final ? await (result as any).final : result;
    return {
      success: true,
      content: typeof finalResult === "string" 
        ? finalResult 
        : finalResult?.content || finalResult?.text || finalResult
    };

  } catch (error: any) {
    console.error("QVAC Server Error:", error);
    return {
      success: false,
      error: error?.message || "Local AI Engine Failure"
    };
  }
}
