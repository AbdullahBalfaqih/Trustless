/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure native QVAC modules are loaded correctly on the server
  experimental: {
    serverExternalPackages: ["@qvac/sdk", "@qvac/llm-llamacpp"],
  },
};

export default nextConfig;
