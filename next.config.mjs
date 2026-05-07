/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // QVAC Multi-Modal Bundle Configuration
  serverExternalPackages: [
    "@qvac/sdk", 
    "@qvac/llm-llamacpp", 
    "@qvac/translation-nmtcpp", 
    "@qvac/ocr-onnx", 
    "@qvac/tts-onnx"
  ],
};

export default nextConfig;
