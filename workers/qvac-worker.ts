import {
  loadModel,
  completion,
  LLAMA_3_2_1B_INST_Q4_0,
} from "@qvac/sdk";

/**
 * Sovereign AI Worker (Stable Module Edition)
 */

let modelId: string | null = null;

self.onmessage = async (e: MessageEvent) => {
  const { type, description } = e.data;

  if (type !== "RUN_OPTIMIZE") return;

  try {
    // 1. Initial Status
    self.postMessage({ type: "STATUS", text: "Initializing GPU Engine..." });

    // 2. Load Model (Singleton)
    if (!modelId) {
      modelId = await loadModel({
        modelSrc: LLAMA_3_2_1B_INST_Q4_0,
        modelType: "llm",
        onProgress: (p: any) => {
          self.postMessage({ type: "PROGRESS", progress: Math.round(p.progress * 100) });
        }
      });
    }

    self.postMessage({ type: "STATUS", text: "Optimizing neural layers..." });

    // 3. Inference
    const result = await completion({
      modelId: modelId!,
      history: [
        {
          role: "user",
          content: `Professionalize and structure this job description: ${description}`,
        },
      ],
    });

    const final = (result as any).final ? await (result as any).final : result;
    const content = typeof final === "string" 
      ? final 
      : final?.content || final?.text || final;

    self.postMessage({ 
      type: "RESULT", 
      content: content
    });

  } catch (err: any) {
    console.error("Worker Error:", err);
    self.postMessage({ 
      type: "ERROR", 
      message: err?.message || "Local AI Execution Error" 
    });
  }
};
