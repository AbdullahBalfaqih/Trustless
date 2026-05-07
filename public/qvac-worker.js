/**
 * QVAC Sovereign AI Worker
 * Isolated runtime to handle WebGPU and Model state independently of React.
 */

// Import the SDK inside the worker context
importScripts("https://cdn.jsdelivr.net/npm/@qvac/sdk/dist/browser/qvac.min.js");

let engine = null;
let model = null;

self.onmessage = async (e) => {
  const { type, description } = e.data;

  if (type === "RUN_OPTIMIZE") {
    try {
      const qvac = (self as any).qvac || (self as any).QVAC;
      if (!qvac) throw new Error("QVAC SDK failed to load in worker");

      // 1. Initialize Engine (Singleton in Worker)
      if (!engine) {
        self.postMessage({ type: "STATUS", text: "Waking up GPU..." });
        engine = await qvac.createEngine({ backend: "webgpu" });
      }

      // 2. Load Model (Singleton in Worker)
      if (!model) {
        self.postMessage({ type: "STATUS", text: "Downloading LLM (1.5GB)..." });
        
        model = await qvac.createModel(engine, {
          provider: "@qvac/llm-llamacpp",
          model: "llama-3.2-1b-instruct",
          onProgress: (p) => {
            self.postMessage({ type: "PROGRESS", progress: Math.round(p.progress * 100) });
          }
        });
      }

      self.postMessage({ type: "STATUS", text: "Generating Intelligence..." });
      
      // 3. Generate Inference
      const result = await model.generate({
        prompt: `Professionalize and structure this job description: ${description}`,
      });

      self.postMessage({ 
        type: "RESULT", 
        content: result.content || result.text 
      });

    } catch (err) {
      self.postMessage({ type: "ERROR", message: err.message });
    }
  }
};
