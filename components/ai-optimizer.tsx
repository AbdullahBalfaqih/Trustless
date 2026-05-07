"use client"

import { useState, useEffect } from "react";
import { toast } from "sonner";

// Singleton to persist AI model across component re-renders
let cachedModelId: string | null = null;
let isInitializing = false;

export default function AiOptimizer({ description, onOptimize }: { description: string, onOptimize: (val: string) => void }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasWebGPU, setHasWebGPU] = useState(false);

  // Check WebGPU support safely after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.gpu) {
      setHasWebGPU(true);
    }
  }, []);

  const handleRunAi = async () => {
    if (!description || description.length < 5) {
      toast.error("Please write a short description first.");
      return;
    }

    if (!hasWebGPU) {
      toast.error("WebGPU is not supported or disabled in your browser. Use Chrome/Edge for Sovereign AI.");
      return;
    }

    setIsOptimizing(true);
    const toastId = "qvac-ai";
    toast.loading("Sovereign AI: Initializing Local Intelligence...", { id: toastId });

    try {
      const qvac = await import("@qvac/sdk");
      
      // 1. Initialize or get cached model (1B is perfect for browser)
      if (!cachedModelId && !isInitializing) {
        isInitializing = true;
        toast.loading("Sovereign AI: Downloading 1B Model (First time only)...", { id: toastId });
        
        // Use the smaller, web-friendly 1B model as recommended
        cachedModelId = await qvac.loadModel({ 
          modelSrc: "llama-3.2-1b-instruct", 
          modelType: "llm",
          modelConfig: { ctx_size: 2048 } // Smaller context for performance
        });
        isInitializing = false;
      }

      toast.loading("Sovereign AI: Generating Professional Text...", { id: toastId });
      
      // 2. Run completion
      const run = qvac.completion({
        modelId: cachedModelId!,
        history: [
          { role: "user", content: `You are a career expert. Professionalize this job description: ${description}` }
        ]
      });

      const result = await run.final;
      
      // 3. Handle result flexibly (content or text)
      const finalContent = result.content || (result as any).text;
      
      if (finalContent) {
        onOptimize(finalContent);
        toast.success("Professional Optimization Complete!", { id: toastId });
      } else {
        throw new Error("Empty response from local AI");
      }
    } catch (err: any) {
      console.error("QVAC Error:", err);
      toast.error(`Local AI Error: ${err.message}`, { id: toastId });
      isInitializing = false; // Reset on failure
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
          Processing Locally...
        </span>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Sovereign AI Polish
        </>
      )}
    </button>
  );
}
