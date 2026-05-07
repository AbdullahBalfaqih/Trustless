"use client"

import { useState, useEffect } from "react";
import { toast } from "sonner";

// Singleton to persist AI model across component re-renders
let cachedEngine: any = null;
let cachedModel: any = null;
let isInitializing = false;
let sdkLoaded = false;

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

  const loadSdkWithProgress = async () => {
    if (sdkLoaded || (window as any).qvac) return true;
    
    setStatusText("Downloading QVAC SDK...");
    const url = "https://cdn.jsdelivr.net/npm/@qvac/sdk/dist/browser/qvac.min.js";
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch SDK");
      
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Body reader not available");
      
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (total > 0) {
          setLoadProgress(Math.round((loaded / total) * 100));
        }
      }
      
      const blob = new Blob(chunks, { type: 'application/javascript' });
      const scriptUrl = URL.createObjectURL(blob);
      
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.onload = () => {
          sdkLoaded = true;
          resolve(true);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    } catch (err) {
      console.error("SDK Load Error:", err);
      return false;
    }
  };

  const handleRunAi = async () => {
    if (!description || description.length < 5) {
      toast.error("Please write a short description first.");
      return;
    }

    if (!hasWebGPU) {
      toast.error("WebGPU is not supported. Please use Chrome/Edge on Desktop.");
      return;
    }

    setIsOptimizing(true);
    setLoadProgress(0);
    
    // 1. Manually load SDK with progress if missing
    const loaded = await loadSdkWithProgress();
    if (!loaded) {
      toast.error("Failed to load AI Engine. Check your connection.");
      setIsOptimizing(false);
      return;
    }

    const qvac = (window as any).qvac || (window as any).QVAC;
    const toastId = "qvac-ai";

    try {
      // 2. Initialize Engine
      if (!cachedEngine) {
        setStatusText("Initializing GPU Engine...");
        cachedEngine = await qvac.createEngine({ backend: "webgpu" });
      }

      // 3. Load Model with Progress Tracking
      if (!cachedModel && !isInitializing) {
        isInitializing = true;
        setStatusText("Downloading LLM Model...");
        setLoadProgress(0);
        
        cachedModel = await qvac.createModel(cachedEngine, {
          provider: "@qvac/llm-llamacpp",
          model: "llama-3.2-1b-instruct",
          onProgress: (p: any) => {
            setLoadProgress(Math.round(p.progress * 100));
          }
        });
        isInitializing = false;
      }

      setStatusText("Generating Optimized Text...");
      setLoadProgress(0);
      
      const result = await cachedModel.generate({
        prompt: `Professionalize and structure this job description: ${description}`,
      });

      const finalContent = result.content || result.text;
      
      if (finalContent) {
        onOptimize(finalContent);
        toast.success("AI Polish Complete!");
      } else {
        throw new Error("No output");
      }
    } catch (err: any) {
      console.error("QVAC Local Error:", err);
      toast.error(`Local AI Error: ${err.message}`);
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
        <div className="w-56 bg-black/80 border border-white/20 rounded-xl p-3 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between text-[11px] text-purple-300 mb-2 font-bold px-1 tracking-tight">
            <span className="truncate max-w-[120px] uppercase">{statusText}</span>
            <span>{loadProgress}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 bg-[length:200%_100%] animate-shimmer transition-all duration-300 ease-out"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      <button
        onClick={handleRunAi}
        disabled={isOptimizing}
        className="px-5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-xs font-black rounded-2xl flex items-center gap-2 transition-all border border-purple-500/40 group min-w-[160px] justify-center shadow-lg active:scale-95"
      >
        {isOptimizing ? (
          <span className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
            {loadProgress > 0 ? "Loading..." : "Wait..."}
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
