/**
 * QVAC Sovereign AI Worker (Isolated Vanilla JS Version)
 * 
 * THIS FILE IS OUTSIDE THE NEXT.JS BUNDLER.
 * IT LOADS VIA CDN INSIDE THE WORKER CONTEXT.
 * ZERO BUILD RISKS. 100% STABILITY.
 */

importScripts("https://cdn.jsdelivr.net/npm/@qvac/sdk/dist/browser/qvac.min.js");

let engine = null;
let model = null;

self.onmessage = async (e) => {
  const { type, description } = e.data;

  if (type !== "RUN_OPTIMIZE") return;

  try {
    const qvac = self.qvac || self.QVAC;
    if (!qvac) throw new Error("QVAC SDK failed to load via CDN");

    // 1. Initialize Engine (Singleton in Worker)
    if (!engine) {
      self.postMessage({ type: "STATUS", text: "Initializing GPU Engine..." });
      engine = await qvac.createEngine({ backend: "webgpu" });
    }

    // 2. Load Model (Singleton in Worker)
    if (!model) {
      self.postMessage({ type: "STATUS", text: "Loading model into GPU memory..." });
      
      model = await qvac.createModel(engine, {
        provider: "@qvac/llm-llamacpp",
        model: "llama-3.2-1b-instruct",
        onProgress: (p) => {
          self.postMessage({ type: "PROGRESS", progress: Math.round(p.progress * 100) });
        }
      });
    }

    self.postMessage({ type: "STATUS", text: "Processing Locally (WebGPU)..." });

    // 3. Generate Inference
    const result = await model.generate({
      prompt: `Professionalize and structure this job description: ${description}`,
    });

    self.postMessage({ 
      type: "RESULT", 
      content: result.content || result.text || result 
    });

  } catch (err) {
    console.error("Local AI Error:", err);
    self.postMessage({ 
      type: "ERROR", 
      message: err.message || "Internal Local AI Error" 
    });
  }
};
