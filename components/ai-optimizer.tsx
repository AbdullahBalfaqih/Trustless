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

    // Initialize the Stable Isolated Worker
    if (typeof window !== "undefined" && !workerRef.current) {
      workerRef.current = new Worker("/qvac-worker.js");
      
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
            toast.error(`AI Error: ${message}`);
            setIsOptimizing(false);
            setLoadProgress(0);
            break;
        }
      };
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
    setStatusText("Initializing Local AI...");
    
    workerRef.current.postMessage({
      type: "RUN_OPTIMIZE",
      description
    });
  };

  return (
    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-3">
      {isOptimizing && (
        <div className="w-56 bg-black/90 border border-purple-500/30 rounded-xl p-3 backdrop-blur-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between text-[10px] text-purple-300 mb-2 font-bold uppercase tracking-tight">
            <span className="truncate max-w-[140px]">{statusText}</span>
            <span>{loadProgress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-500 ease-out"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      <button
        onClick={handleRunAi}
        disabled={isOptimizing}
        className="px-5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 text-xs font-bold rounded-2xl flex items-center gap-2 transition-all border border-purple-500/30 group min-w-[170px] justify-center shadow-lg active:scale-95"
      >
        {isOptimizing ? (
          <span className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-purple-400/20 border-t-purple-400 rounded-full animate-spin" />
            LOCAL AI...
          </span>
        ) : (
          <>
            <svg className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Sovereign AI Builder
          </>
        )}
      </button>
    </div>
  );
}
