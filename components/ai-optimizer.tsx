"use client"

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function AiOptimizer({ description, onOptimize }: { description: string, onOptimize: (val: string) => void }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasWebGPU, setHasWebGPU] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.gpu) {
      setHasWebGPU(true);
    }

    // Initialize the FINAL Module Worker
    if (typeof window !== "undefined" && !workerRef.current) {
      try {
        workerRef.current = new Worker(
          new URL("../workers/qvac-worker.ts", import.meta.url),
          { type: "module" } // This is crucial for ESM support in workers
        );
        
        workerRef.current.onmessage = (e) => {
          const { type, text, progress, content, message } = e.data;
          
          switch (type) {
            case "STATUS":
              setStatusText(text);
              break;
            case "PROGRESS":
              setLoadProgress(progress);
              break;
            case "RESULT":
              onOptimize(content);
              setIsOptimizing(false);
              setLoadProgress(0);
              setStatusText("");
              toast.success("AI Polish Complete!");
              break;
            case "ERROR":
              toast.error(`Local AI Error: ${message}`);
              setIsOptimizing(false);
              setLoadProgress(0);
              break;
          }
        };

        workerRef.current.onerror = (err) => {
          console.error("Worker Initialization Error:", err);
          toast.error("Failed to start AI Engine. Your browser might not support WebGPU Workers.");
          setIsOptimizing(false);
        };
      } catch (e) {
        console.error("Worker Creation Failed:", e);
      }
    }
  }, [onOptimize]);

  const handleRunAi = () => {
    if (!description || description.length < 5) {
      toast.error("Please write a short description first.");
      return;
    }

    if (!hasWebGPU) {
      toast.error("WebGPU is not supported. Use Chrome/Edge on Desktop.");
      return;
    }

    if (!workerRef.current) {
      toast.error("AI Engine is still warming up...");
      return;
    }

    setIsOptimizing(true);
    setLoadProgress(0);
    setStatusText("Initializing Sovereign AI...");
    
    workerRef.current.postMessage({
      type: "RUN_OPTIMIZE",
      description
    });
  };

  return (
    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-3">
      {isOptimizing && (
        <div className="w-60 bg-black/95 border border-purple-500/40 rounded-xl p-3 backdrop-blur-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-white/10">
          <div className="flex justify-between text-[11px] text-purple-300 mb-2 font-black uppercase tracking-widest italic">
            <span className="truncate max-w-[150px]">{statusText}</span>
            <span className="tabular-nums">{loadProgress}%</span>
          </div>
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
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
        className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-xs font-black rounded-2xl flex items-center gap-3 transition-all border border-purple-500/50 group min-w-[200px] justify-center shadow-[0_0_25px_rgba(168,85,247,0.2)] active:scale-95"
      >
        {isOptimizing ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-purple-400/20 border-t-purple-400 rounded-full animate-spin" />
            LOCAL AI WORKING...
          </span>
        ) : (
          <>
            <svg className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            SOVEREIGN AI BUILDER
          </>
        )}
      </button>
    </div>
  );
}
