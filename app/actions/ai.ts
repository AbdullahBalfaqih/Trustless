"use server"

import { 
  loadModel, 
  completion, 
  translate,
  ocr,
  LLAMA_3_2_1B_INST_Q4_0,
} from "@qvac/sdk";

export const runtime = "nodejs";
export const maxDuration = 300;

// Cached Model IDs for different tasks
let engineModelId: string | null = null;
let translatorModelId: string | null = null;
let ocrModelId: string | null = null;

/**
 * 1. LLM OPTIMIZER (Text Generation)
 */
export async function PolishWithSovereignAI(description: string) {
  try {
    process.env.QVAC_RPC_TIMEOUT = "300000";
    if (!engineModelId) {
      engineModelId = await loadModel({
        modelSrc: LLAMA_3_2_1B_INST_Q4_0,
        modelType: "llm",
      });
    }

    const result = await completion({
      modelId: engineModelId!,
      history: [
        {
          role: "user",
          content: `Professionalize this job description: \n\n${description}`,
        },
      ],
    });

    const finalResult = (result as any).final ? await (result as any).final : result;
    return {
      success: true,
      content: typeof finalResult === "string" ? finalResult : finalResult?.content || finalResult?.text
    };
  } catch (error: any) {
    console.error("QVAC LLM Error:", error);
    engineModelId = null;
    return { success: false, error: error?.message };
  }
}

/**
 * 2. TRANSLATION (NMT)
 */
export async function TranslateWithSovereignAI(text: string, targetLang: string = "ar") {
  try {
    if (!translatorModelId) {
      translatorModelId = await loadModel({
        modelSrc: "nmt-opus-mt-en-ar", // Example English-Arabic model
        modelType: "nmt",
      });
    }

    const result = await translate({
      modelId: translatorModelId!,
      text: text,
    });

    return { success: true, content: (result as any).text || result };
  } catch (error: any) {
    console.error("QVAC NMT Error:", error);
    translatorModelId = null;
    return { success: false, error: "Translation model loading or inference failed." };
  }
}

/**
 * 3. OCR (Image to Text)
 */
export async function ExtractTextWithSovereignOCR(imageBase64: string) {
  try {
    if (!ocrModelId) {
      ocrModelId = await loadModel({
        modelSrc: "ocr-tesseract-fast",
        modelType: "ocr",
      });
    }

    // Process image buffer
    const buffer = Buffer.from(imageBase64.split(",")[1], "base64");
    const result = await ocr({
      modelId: ocrModelId!,
      image: buffer,
    });

    return { success: true, content: (result as any).text || result };
  } catch (error: any) {
    console.error("QVAC OCR Error:", error);
    ocrModelId = null;
    return { success: false, error: "OCR engine failure." };
  }
}
