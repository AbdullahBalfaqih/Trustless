"use server"

import { 
  loadModel, 
  completion, 
  LLAMA_3_2_1B_INST_Q4_0,
} from "@qvac/sdk";

/**
 * Sovereign AI Engine (The $10k Hackathon Track Edition)
 * Pure Node.js execution via Next.js Server Actions.
 * 
 * WHY THIS WINS:
 * 1. Uses the official @qvac/sdk and @qvac/llm-llamacpp.
 * 2. Runs 100% locally on the device (where the server is hosted).
 * 3. Bypasses all browser bundling issues (Turbopack/Webpack).
 */

let engineModelId: string | null = null;

export async function PolishWithSovereignAI(description: string) {
  try {
    console.log("🚀 Initializing QVAC Sovereign Engine...");

    // 1. Load the model (Singleton pattern to prevent re-loading)
    if (!engineModelId) {
      engineModelId = await loadModel({
        modelSrc: LLAMA_3_2_1B_INST_Q4_0,
        modelType: "llm",
        // Note: Progress is logged to the server console during load
        onProgress: (p) => console.log(`[QVAC] Loading: ${Math.round(p.progress * 100)}%`),
      });
    }

    console.log("🧠 QVAC Reasoning started...");

    // 2. Perform Inference
    const result = await completion({
      modelId: engineModelId!,
      history: [
        {
          role: "user",
          content: `You are a professional hiring expert. Take this job description and make it sound premium, professional, and well-structured. Keep the same meaning but improve the vocabulary and tone: \n\n${description}`,
        },
      ],
      stream: false, // Simple response for stable server actions
    });

    // 3. Finalize
    const finalResult = (result as any).final ? await (result as any).final : result;
    const content = typeof finalResult === "string" 
      ? finalResult 
      : finalResult?.content || finalResult?.text || finalResult;

    console.log("✅ QVAC Polish Complete.");

    return {
      success: true,
      content: content
    };

  } catch (error: any) {
    console.error("❌ QVAC Critical Error:", error);
    return {
      success: false,
      error: error?.message || "Local AI Engine offline. Ensure Vulkan/WebGPU is supported."
    };
  }
}
