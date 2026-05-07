/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // In Next.js 15+, serverExternalPackages is a top-level property
  serverExternalPackages: ["@qvac/sdk", "@qvac/llm-llamacpp"],
};

export default nextConfig;
