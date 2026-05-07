"use client"

import { useState, useEffect } from "react";
import { toast } from "sonner";

// Singleton to persist AI model across component re-renders
let cachedEngine: any = null;
let cachedModel: any = null;
let isInitializing = false;

export default function AiOptimizer({ description, onOptimize }: { description: string, onOptimize: (val: string) => void }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasWebGPU, setHasWebGPU] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

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
      toast.error("WebGPU is not supported. Please use Chrome/Edge on Desktop.");
      return;
    }

    const qvac = (window as any).qvac || (window as any).QVAC;
    if (!qvac) {
      toast.info("The QVAC Engine is still loading in the background. Please try again in 5 seconds.");
      return;
    }

    setIsOptimizing(true);
    const toastId = "qvac-ai";
    setStatusText("Initializing GPU Engine...");

    try {
      // 1. Initialize Engine
      if (!cachedEngine) {
        cachedEngine = await qvac.createEngine({ backend: "webgpu" });
      }

      // 2. Load Model with Progress Tracking
      if (!cachedModel && !isInitializing) {
        isInitializing = true;
        setStatusText("Downloading LLM Model...");
        
        cachedModel = await qvac.createModel(cachedEngine, {
          provider: "@qvac/llm-llamacpp",
          model: "llama-3.2-1b-instruct",
          onProgress: (progress: any) => {
            const percent = Math.round(progress.progress * 100);
            setLoadProgress(percent);
          }
        });
        isInitializing = false;
      }

      setStatusText("Generating Optimized Text...");
      setLoadProgress(0); // Reset for generation
      
      // 3. Generate
      const result = await cachedModel.generate({
        prompt: `Professionalize and structure this job description: ${description}`,
      });

      const finalContent = result.content || result.text;
      
      if (finalContent) {
        onOptimize(finalContent);
        toast.success("AI Polish Complete!", { id: toastId });
      } else {
        throw new Error("No output from engine");
      }
    } catch (err: any) {
      console.error("QVAC Local Error:", err);
      toast.error(`Local AI Error: ${err.message}`, { id: toastId });
      isInitializing = false;
    } finally {
      setIsOptimizing(false);
      setLoadProgress(0);
      setStatusText("");
    }
  };

  return (
    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-3">
      {isOptimizing && (
        <div className="w-48 bg-white/5 border border-white/10 rounded-lg p-2 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between text-[10px] text-purple-300 mb-1.5 font-medium px-1">
            <span className="truncate max-w-[100px]">{statusText}</span>
            <span>{loadProgress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      <button
        onClick={handleRunAi}
        disabled={isOptimizing}
        className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all border border-purple-500/30 group min-w-[140px] justify-center"
      >
        {isOptimizing ? (
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
            {loadProgress > 0 ? "Loading Model..." : "Processing..."}
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
    </div>
  );
}
