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
        // For a real demo, we'd trigger a file picker
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
    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-3 z-50">
      {/* Mode Selector */}
      <div className="flex gap-1 p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl">
        {(["polish", "translate", "ocr"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${
              mode === m ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-white/40 hover:text-white/60"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {isOptimizing && (
        <div className="w-64 bg-black/95 border border-purple-500/40 rounded-2xl p-4 backdrop-blur-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 ring-1 ring-white/10">
          <div className="flex justify-between text-[10px] text-purple-300 mb-2 font-black uppercase italic">
            <span>Sovereign {mode} Engine...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 bg-[length:200%_100%] animate-shimmer transition-all duration-700 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      
      <button
        onClick={runTask}
        disabled={isOptimizing}
        className="px-6 py-4 bg-purple-600/10 hover:bg-purple-600/20 text-purple-100 text-[11px] font-black rounded-2xl flex items-center gap-3 transition-all border border-purple-500/40 group min-w-[220px] justify-center shadow-2xl active:scale-95 backdrop-blur-3xl"
      >
        <div className="p-1 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/40">
           <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
        </div>
        SOVEREIGN {mode.toUpperCase()} ENGINE
      </button>
    </div>
  );
}
