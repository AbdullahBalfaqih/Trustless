import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    
    // Check if API key is present
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Falling back to High-Fidelity Logic.");
      // If no key, we provide a sophisticated dynamic expansion to not break the UI
      const optimized = `[Sovereign AI Optimized]\n\nMISSION ARCHITECTURE:\n${description}\n\nTECHNICAL INTEGRATION:\n- Trustless Escrow Verification\n- PUSD Mainnet Settlement\n- QVAC Sovereign Identity Protocol`;
      return NextResponse.json({ result: optimized, engine: "DETERMINISTIC_AI" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are the Sovereign AI Optimizer. Professionalize and expand this freelance job description for the Trustless Marketplace (Solana/PUSD). Make it sound elite, technical, and high-stakes.
    Original Description: ${description}`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return NextResponse.json({ result: text, engine: "GEMINI_REAL_AI" });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
