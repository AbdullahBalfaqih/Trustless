/**
 * QVAC Sovereign AI Worker (Enhanced Debug Version)
 */

// 1. Notify UI immediately that worker script is loaded
self.postMessage({ type: "STATUS", text: "Worker Script Loaded..." });

try {
  importScripts("https://cdn.jsdelivr.net/npm/@qvac/sdk/dist/browser/qvac.min.js");
  self.postMessage({ type: "STATUS", text: "SDK Library Loaded..." });
} catch (e) {
  self.postMessage({ type: "ERROR", message: "Failed to load QVAC SDK from CDN. Check your connection." });
}

let engine = null;
let model = null;

self.onmessage = async (e) => {
  const { type, description } = e.data;

  if (type !== "RUN_OPTIMIZE") return;

  try {
    const qvac = self.qvac || self.QVAC;
    if (!qvac) {
      throw new Error("QVAC SDK is not available in Global Scope. Possible CDN failure.");
    }

    // 1. Initialize Engine (Singleton)
    if (!engine) {
      self.postMessage({ type: "STATUS", text: "Booting WebGPU Engine..." });
      engine = await qvac.createEngine({ backend: "webgpu" });
    }

    // 2. Load Model with Staged Status
    if (!model) {
      self.postMessage({ type: "STATUS", text: "Allocating GPU Memory..." });
      
      model = await qvac.createModel(engine, {
        provider: "@qvac/llm-llamacpp",
        model: "llama-3.2-1b-instruct",
        onProgress: (p) => {
          self.postMessage({ type: "PROGRESS", progress: Math.round(p.progress * 100) });
        }
      });
    }

    self.postMessage({ type: "STATUS", text: "Neural Inference Running..." });

    // 3. Generate
    const result = await model.generate({
      prompt: `Professionalize and structure this job description: ${description}`,
    });

    self.postMessage({ 
      type: "RESULT", 
      content: result.content || result.text || result 
    });

  } catch (err) {
    console.error("Worker Error:", err);
    self.postMessage({ 
      type: "ERROR", 
      message: err.message || "GPU Context Error" 
    });
  }
};
