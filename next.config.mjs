import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // 1. Core Node Fallbacks for the Browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      url: false,
      "node:fs": false,
      "node:path": false,
      "node:os": false,
    };

    // 2. The Master Fix: Force-replace the specific file causing the Vercel error
    // We point the Node RPC client to a completely empty file
    const emptyModulePath = path.resolve("./empty-module.js");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@qvac/sdk/dist/client/rpc/node-rpc-client.js": emptyModulePath,
    };

    return config;
  },
};

export default nextConfig;
