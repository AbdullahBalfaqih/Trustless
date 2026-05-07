"use client"

import { useState, useEffect } from "react";
import { toast } from "sonner";

// Global types for QVAC window object
declare global {
  interface Window {
    qvac: any;
  }
}

// Singleton to persist AI model across component re-renders
let cachedEngine: any = null;
let cachedModel: any = null;
let isInitializing = false;

export default function AiOptimizer({ description, onOptimize }: { description: string, onOptimize: (val: string) => void }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasWebGPU, setHasWebGPU] = useState(false);

  // Check WebGPU support safely after mount
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
      toast.error("WebGPU is not supported. Please use Chrome/Edge on a desktop.");
      return;
    }

    const qvac = (window as any).qvac;
    if (!qvac) {
      toast.error("Sovereign AI (QVAC) is still loading... Please wait a second.");
      return;
    }

    setIsOptimizing(true);
    const toastId = "qvac-ai";
    toast.loading("Sovereign AI: Powering up local GPU engine...", { id: toastId });

    try {
      // 1. Initialize Engine (Singleton)
      if (!cachedEngine) {
        cachedEngine = await qvac.createEngine({
          backend: "webgpu",
        });
      }

      // 2. Load Model (Singleton - 1B for speed/judging efficiency)
      if (!cachedModel && !isInitializing) {
        isInitializing = true;
        toast.loading("Sovereign AI: Loading 1B Model to GPU Memory...", { id: toastId });
        
        cachedModel = await qvac.createModel(cachedEngine, {
          provider: "@qvac/llm-llamacpp",
          model: "llama-3.2-1b-instruct",
        });
        isInitializing = false;
      }

      toast.loading("Sovereign AI: Generating Local Intelligence...", { id: toastId });
      
      // 3. Generate (Real On-Device Inference)
      const result = await cachedModel.generate({
        prompt: `Professionalize and structure this job description: ${description}`,
      });

      const finalContent = result.content || result.text;
      
      if (finalContent) {
        onOptimize(finalContent);
        toast.success("AI Build Complete (Processed Locally on GPU)!", { id: toastId });
      } else {
        throw new Error("No output from local engine");
      }
    } catch (err: any) {
      console.error("QVAC Local Error:", err);
      toast.error(`Local AI Error: ${err.message}. Ensure your device supports WebGPU.`, { id: toastId });
      isInitializing = false;
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <button
      onClick={handleRunAi}
      disabled={isOptimizing}
      className="absolute right-4 bottom-4 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all border border-purple-500/30 group"
    >
      {isOptimizing ? (
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          Local AI Working...
        </span>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Sovereign AI Builder
        </>
      )}
    </button>
  );
}
