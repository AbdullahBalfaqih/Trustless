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
    
    // Inject SDK script normally to avoid CORS issues, but do it here for better control
    if (typeof window !== "undefined" && !(window as any).qvac) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@qvac/sdk/dist/browser/qvac.min.js";
      script.async = true;
      document.head.appendChild(script);
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
      toast.info("The AI Engine is still initializing. Please wait 10 seconds and try again.");
      return;
    }

    setIsOptimizing(true);
    const toastId = "qvac-ai";

    try {
      // 1. Initialize Engine
      if (!cachedEngine) {
        setStatusText("Waking up GPU...");
        cachedEngine = await qvac.createEngine({ backend: "webgpu" });
      }

      // 2. Load Model with Progress Tracking
      if (!cachedModel && !isInitializing) {
        isInitializing = true;
        setStatusText("Downloading LLM (1.5GB)...");
        
        cachedModel = await qvac.createModel(cachedEngine, {
          provider: "@qvac/llm-llamacpp",
          model: "llama-3.2-1b-instruct",
          onProgress: (p: any) => {
            const percent = Math.round(p.progress * 100);
            setLoadProgress(percent);
          }
        });
        isInitializing = false;
      }

      setStatusText("Finalizing Build...");
      setLoadProgress(100);
      
      // 3. Generate
      const result = await cachedModel.generate({
        prompt: `Professionalize and structure this job description: ${description}`,
      });

      const finalContent = result.content || result.text;
      
      if (finalContent) {
        onOptimize(finalContent);
        toast.success("Professional AI Polish Complete!");
      } else {
        throw new Error("Empty AI response");
      }
    } catch (err: any) {
      console.error("QVAC Local Error:", err);
      toast.error(`AI Error: ${err.message}`);
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
        <div className="w-56 bg-black/90 border border-purple-500/30 rounded-xl p-3 backdrop-blur-3xl shadow-[0_0_30px_rgba(168,85,247,0.2)] animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="flex justify-between text-[11px] text-purple-300 mb-2 font-black uppercase tracking-widest">
            <span className="truncate max-w-[140px]">{statusText}</span>
            <span>{loadProgress}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 bg-[length:200%_100%] animate-shimmer transition-all duration-500 ease-out rounded-full"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      <button
        onClick={handleRunAi}
        disabled={isOptimizing}
        className="px-5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-xs font-black rounded-2xl flex items-center gap-2 transition-all border border-purple-500/40 group min-w-[170px] justify-center shadow-[0_0_15px_rgba(168,85,247,0.1)] active:scale-95"
      >
        {isOptimizing ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-purple-400/20 border-t-purple-400 rounded-full animate-spin" />
            {loadProgress > 0 ? `Loading ${loadProgress}%` : "Initing GPU..."}
          </span>
        ) : (
          <>
            <svg className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            SOVEREIGN AI BUILDER
          </>
        )}
      </button>
    </div>
  );
}
