"use client"

import { useState } from "react";
import { toast } from "sonner";
import { optimizeJobDescription } from "@/app/actions/ai";

export default function AiOptimizer({ description, onOptimize }: { description: string, onOptimize: (val: string) => void }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const handleRunAi = async () => {
    if (!description || description.length < 5) {
      toast.error("Please write a short description first.");
      return;
    }

    setIsOptimizing(true);
    setLoadProgress(10); // Start progress feel

    try {
      // Simulate staged progress for better UX
      const progressInterval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 500);

      const result = await optimizeJobDescription(description);

      clearInterval(progressInterval);
      setLoadProgress(100);

      if (result.success && result.content) {
        onOptimize(result.content);
        toast.success("Sovereign AI Optimization Complete!");
      } else {
        toast.error(result.error || "Optimization Failed");
      }
    } catch (err) {
      console.error("AI Action Error:", err);
      toast.error("Could not connect to Sovereign Engine.");
    } finally {
      setIsOptimizing(false);
      setTimeout(() => setLoadProgress(0), 1000);
    }
  };

  return (
    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-3">
      {isOptimizing && (
        <div className="w-56 bg-black/95 border border-purple-500/40 rounded-xl p-3 backdrop-blur-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-white/10">
          <div className="flex justify-between text-[11px] text-purple-300 mb-2 font-black uppercase tracking-tighter">
            <span className="truncate max-w-[140px] italic">Sovereign Reasoning...</span>
            <span className="tabular-nums">{loadProgress}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-500 ease-out rounded-full"
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
            SOVEREIGN ENGINE...
          </span>
        ) : (
          <>
            <svg className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            SOVEREIGN AI OPTIMIZER
          </>
        )}
      </button>
    </div>
  );
}
