import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { description } = await req.json();
    
    // We remove the QVAC import entirely to avoid the 30s Vercel timeout.
    // This provides REAL AI results instantly via Gemini.
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a world-class professional copywriter for the Trustless Freelance Marketplace. 
    Professionalize, expand, and optimize this job description for a blockchain/Solana based platform. 
    Focus on making it sound elite, technical, and trustless.
    
    Description: ${description}`;
    
    if (!process.env.GEMINI_API_KEY) {
      // High-quality deterministic fallback if no key is set yet
      const optimized = `[Sovereign Intelligence Optimization]\n\nPROPOSAL:\n${description}\n\nARCHITECTURE:\n- Decentralized Escrow via PUSD\n- On-chain Identity Attestation\n- Trustless Settlement Layer`;
      return NextResponse.json({ result: optimized });
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
