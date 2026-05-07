"use client"

import { useState } from "react";
import { toast } from "sonner";
import { PolishWithSovereignAI, TranslateWithSovereignAI, ExtractTextWithSovereignOCR } from "@/app/actions/ai";

export default function AiOptimizer({ description, onOptimize }: { description: string, onOptimize: (val: string) => void }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<"polish" | "translate" | "ocr">("polish");

  const runTask = async () => {
    setIsOptimizing(true);
    setProgress(5);
    const interval = setInterval(() => setProgress(p => p < 90 ? p + 2 : 90), 500);

    try {
      let result;
      if (mode === "polish") {
        if (!description) throw new Error("Write something to optimize.");
        result = await PolishWithSovereignAI(description);
      } else if (mode === "translate") {
        if (!description) throw new Error("Write something to translate.");
        result = await TranslateWithSovereignAI(description, "ar");
      } else if (mode === "ocr") {
        toast.info("OCR Mode: Image upload triggered. (Demo)");
        setIsOptimizing(false);
        clearInterval(interval);
        return;
      }

      if (result?.success && result.content) {
        onOptimize(result.content);
        toast.success(`Sovereign ${mode.toUpperCase()} Complete!`);
      } else {
        toast.error(result?.error || "Task Failed");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      clearInterval(interval);
      setProgress(100);
      setIsOptimizing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="absolute left-4 bottom-4 flex flex-col items-start gap-3 z-50">
      {/* Mode Selector - White BG, Black Text */}
      <div className="flex gap-1 p-1 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-xl shadow-xl">
        {(["polish", "translate", "ocr"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-tight rounded-lg transition-all duration-300 ${
              mode === m 
                ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {isOptimizing && (
        <div className="w-56 bg-black/90 border border-blue-500/40 rounded-2xl p-3 backdrop-blur-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 ring-1 ring-white/10">
          <div className="flex justify-between text-[9px] text-blue-300 mb-2 font-black uppercase italic tracking-widest">
            <span>{mode} engine active</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 bg-[length:200%_100%] animate-shimmer transition-all duration-700 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <button
        onClick={runTask}
        disabled={isOptimizing}
        className="px-5 py-2.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-100 text-[10px] font-black rounded-xl flex items-center gap-2.5 transition-all border border-blue-500/50 group min-w-[180px] justify-center shadow-[0_0_30px_rgba(37,99,235,0.15)] active:scale-95 backdrop-blur-xl"
      >
        {isOptimizing ? (
          <div className="w-3.5 h-3.5 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
        ) : (
          <div className="p-1 bg-blue-500/20 rounded-md group-hover:bg-blue-500/40 transition-colors">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        )}
        <span className="tracking-tight">SOVEREIGN {mode.toUpperCase()}</span>
      </button>
    </div>
  );
}
