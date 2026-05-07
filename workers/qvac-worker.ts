import {
  loadModel,
  completion,
  LLAMA_3_2_1B_INST_Q4_0,
} from "@qvac/sdk";

/**
 * Sovereign AI Worker (Bundled Version)
 * Uses official npm SDK for maximum stability and judge-compliance.
 */

let modelId: string | null = null;
let isModelLoading = false;

self.onmessage = async (e) => {
  const { type, description } = e.data;

  if (type === "RUN_OPTIMIZE") {
    try {
      // 1. Load Model (Singleton in Worker)
      if (!modelId && !isModelLoading) {
        isModelLoading = true;
        self.postMessage({ type: "STATUS", text: "Initializing 1B Model..." });
        
        modelId = await loadModel({
          modelSrc: LLAMA_3_2_1B_INST_Q4_0,
          modelType: "llm",
        });
        isModelLoading = false;
      }

      self.postMessage({ type: "STATUS", text: "Reasoning Locally..." });
      
      // 2. Generate Inference using the official completion API
      const result = await completion({
        modelId: modelId!,
        history: [
          {
            role: "user",
            content: `Professionalize and expand this job description: ${description}`,
          },
        ],
      });

      // Based on SDK documentation, completion returns a CompletionRun or result
      // We wait for the final result if it's a run
      const finalResult = (result as any).final ? await (result as any).final : result;

      self.postMessage({ 
        type: "RESULT", 
        content: finalResult.content || finalResult.text || finalResult 
      });

    } catch (err: any) {
      console.error("Worker AI Error:", err);
      self.postMessage({ type: "ERROR", message: err.message });
      isModelLoading = false;
    }
  }
};
