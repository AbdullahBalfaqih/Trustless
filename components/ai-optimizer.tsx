"use client"

import { useState } from "react";
import { toast } from "sonner";

// Global engine variable to persist memory
let globalEngine: any = null;

export default function AiOptimizer({ description, onOptimize }: { description: string, onOptimize: (val: string) => void }) {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleRunAi = async () => {
    if (!description || description.length < 5) {
      toast.error("Please write a short description first.");
      return;
    }

    setIsOptimizing(true);
    const toastId = "real-qvac-ai";
    toast.loading("Sovereign AI: Initializing QVAC SDK...", { id: toastId });

    try {
      // 1. Isolated Dynamic Import
      const { QvacEngine } = await import("@qvac/sdk");
      
      if (!globalEngine) {
        toast.loading("Sovereign AI: Loading Llama Model to GPU...", { id: toastId });
        globalEngine = new QvacEngine();
        await globalEngine.initialize();
      }

      toast.loading("Sovereign AI: Processing Sovereign Intelligence...", { id: toastId });
      
      const response = await globalEngine.chat(`Expand and professionalize this job description: ${description}`);
      
      if (response && response.content) {
        onOptimize(response.content);
        toast.success("AI Polish Complete via QVAC SDK!", { id: toastId });
      } else {
        throw new Error("No response from engine");
      }
    } catch (err: any) {
      console.error("QVAC SDK Error:", err);
      toast.error(`AI Error: ${err.message}. Ensure your browser supports WebGPU.`, { id: toastId });
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
          Processing...
        </span>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Polish (Real QVAC)
        </>
      )}
    </button>
  );
}
