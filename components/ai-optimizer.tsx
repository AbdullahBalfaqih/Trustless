"use client"

import { useState } from "react";
import { toast } from "sonner";
import { PolishWithSovereignAI } from "@/app/actions/ai";

export default function AiOptimizer({ description, onOptimize }: { description: string, onOptimize: (val: string) => void }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRunAi = async () => {
    if (!description || description.length < 5) {
      toast.error("Please write a short description first.");
      return;
    }

    setIsOptimizing(true);
    setProgress(5);

    try {
      // UX Progress Simulation (Since server actions are request-response)
      const interval = setInterval(() => {
        setProgress(prev => (prev < 95 ? prev + 2 : 95));
      }, 400);

      const result = await PolishWithSovereignAI(description);

      clearInterval(interval);
      setProgress(100);

      if (result.success && result.content) {
        onOptimize(result.content);
        toast.success("Sovereign AI: Professional Polish Applied!");
      } else {
        toast.error(result.error || "Sovereign Engine Error");
      }
    } catch (err) {
      console.error("AI Action Error:", err);
      toast.error("Local Sovereign Engine is not responding.");
    } finally {
      setIsOptimizing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-3 z-50">
      {isOptimizing && (
        <div className="w-64 bg-black/95 border border-purple-500/40 rounded-2xl p-4 backdrop-blur-3xl shadow-[0_0_50px_rgba(168,85,247,0.25)] animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-white/10">
          <div className="flex justify-between text-[10px] text-purple-300 mb-2 font-black uppercase tracking-[0.2em] italic">
            <span className="truncate max-w-[160px] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
              Sovereign Reasoning...
            </span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 bg-[length:200%_100%] animate-shimmer transition-all duration-700 ease-out rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[9px] text-white/40 mt-2 font-medium tracking-tight">
             Processing 100% locally via QVAC SDK
          </p>
        </div>
      )}
      
      <button
        onClick={handleRunAi}
        disabled={isOptimizing}
        className="px-6 py-3.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-100 text-[11px] font-black rounded-2xl flex items-center gap-3 transition-all border border-purple-500/40 group min-w-[220px] justify-center shadow-xl active:scale-95 backdrop-blur-xl"
      >
        {isOptimizing ? (
          <span className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-purple-400/20 border-t-purple-400 rounded-full animate-spin" />
            ENGINE ACTIVE...
          </span>
        ) : (
          <>
            <div className="p-1 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/40 transition-colors">
              <svg className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            SOVEREIGN AI OPTIMIZER
          </>
        )}
      </button>
    </div>
  );
}
