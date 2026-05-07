"use client"

import { useState } from "react";
import { toast } from "sonner";

// Global engine variable to persist memory


export default function AiOptimizer({ description, onOptimize }: { description: string, onOptimize: (val: string) => void }) {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleRunAi = async () => {
    if (!description || description.length < 5) {
      toast.error("Please write a short description first.");
      return;
    }

    setIsOptimizing(true);
    const toastId = "real-qvac-ai";
    toast.loading("Sovereign AI: Initializing QVAC SDK...", { id: toastId });

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to optimize");
      }

      const data = await response.json();
      if (data.result) {
        onOptimize(data.result);
        toast.success("AI Polish Complete via QVAC SDK!", { id: toastId });
      } else {
        throw new Error("No response from AI engine");
      }
    } catch (err: any) {
      console.error("AI Error:", err);
      toast.error(`AI Error: ${err.message}.`, { id: toastId });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <button
      onClick={handleRunAi}
      disabled={isOptimizing}
      className="absolute right-4 bottom-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all border border-white/10"
    >
      {isOptimizing ? (
        <span className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Polish (Real QVAC)
        </>
      )}
    </button>
  );
}
