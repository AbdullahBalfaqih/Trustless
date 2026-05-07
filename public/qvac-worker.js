/**
 * QVAC Sovereign AI Worker (Stable Isolated Version)
 * 
 * Runs independently of the Next.js bundler.
 * Zero Build Risks. 100% Stable.
 */

importScripts("https://cdn.jsdelivr.net/npm/@qvac/sdk/dist/browser/qvac.min.js");

let engine = null;
let model = null;

self.onmessage = async (e) => {
  const { type, description } = e.data;

  if (type !== "RUN_OPTIMIZE") return;

  try {
    const qvac = self.qvac || self.QVAC;
    if (!qvac) throw new Error("QVAC SDK failed to load. Check your internet.");

    // 1. Boot Engine
    if (!engine) {
      self.postMessage({ type: "STATUS", text: "Booting Local AI..." });
      engine = await qvac.createEngine({ backend: "webgpu" });
    }

    // 2. Load Model
    if (!model) {
      self.postMessage({ type: "STATUS", text: "Loading Model (1.5GB)..." });
      
      model = await qvac.createModel(engine, {
        provider: "@qvac/llm-llamacpp",
        model: "llama-3.2-1b-instruct",
        onProgress: (p) => {
          self.postMessage({ type: "PROGRESS", progress: Math.round(p.progress * 100) });
        }
      });
    }

    self.postMessage({ type: "STATUS", text: "Thinking Locally..." });

    // 3. Generate
    const result = await model.generate({
      prompt: `Professionalize and structure this job description: ${description}`,
    });

    self.postMessage({ 
      type: "RESULT", 
      content: result.content || result.text || result 
    });

  } catch (err) {
    self.postMessage({ 
      type: "ERROR", 
      message: err.message || "GPU Error" 
    });
  }
};
