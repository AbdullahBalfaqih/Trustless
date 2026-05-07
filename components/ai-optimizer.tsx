"use client"

import { useState } from "react";
import { toast } from "sonner";

export default function AiOptimizer({ description, onOptimize }: { description: string, onOptimize: (val: string) => void }) {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleRunAi = async () => {
    if (!description || description.length < 5) {
      toast.error("Please write a short description first.");
      return;
    }

    setIsOptimizing(true);
    const toastId = "qvac-ai";
    toast.loading("Sovereign AI: Initializing QVAC SDK in Browser...", { id: toastId });

    try {
      // 0. Check for WebGPU support (Required for QVAC browser inference)
      if (!navigator.gpu) {
        throw new Error("WebGPU is not supported in this browser. Please use Chrome, Edge, or a browser with WebGPU enabled for local Sovereign AI.");
      }

      // 1. Dynamic import to ensure it only runs in browser
      const qvac = await import("@qvac/sdk");
      
      toast.loading("Sovereign AI: Loading LLM to GPU (WebGPU)...", { id: toastId });
      
      // 2. Load the model using the official functional API
      // We use LLAMA_3_2_1B_INST_Q4_0 as per docs
      const modelId = await qvac.loadModel({ 
        modelSrc: qvac.LLAMA_3_2_1B_INST_Q4_0 || "llama-3-8b-instruct",
        modelType: "llm",
        modelConfig: {}
      });

      toast.loading("Sovereign AI: Processing Local Intelligence...", { id: toastId });
      
      // 3. Run completion
      const run = qvac.completion({
        modelId,
        history: [
          { role: "user", content: `Professionalize and expand this job description: ${description}` }
        ]
      });

      const result = await run.final;
      
      if (result && result.content) {
        onOptimize(result.content);
        toast.success("AI Polish Complete via Local QVAC SDK!", { id: toastId });
      } else {
        throw new Error("No response from QVAC engine");
      }
    } catch (err: any) {
      console.error("QVAC Browser Error:", err);
      toast.error(`QVAC Error: ${err.message}. Make sure your browser supports WebGPU.`, { id: toastId });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <button
      onClick={handleRunAi}
      disabled={isOptimizing}
      className="absolute right-4 bottom-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all border border-white/10"
    >
      {isOptimizing ? (
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          QVAC Processing...
        </span>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Polish (QVAC SDK)
        </>
      )}
    </button>
  );
}
