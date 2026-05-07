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
    // 1. Comprehensive Node.js Fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      url: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      "node:fs": false,
      "node:path": false,
      "node:os": false,
      "node:crypto": false,
      "node:stream": false,
      "node:url": false,
    };

    // 2. Absolute Kill: Force-replace the specific file causing the build error
    const emptyModulePath = path.resolve("./empty-module.js");
    config.resolve.alias = {
      ...config.resolve.alias,
      // Target the exact path shown in the build trace
      "@qvac/sdk/dist/client/rpc/node-rpc-client.js": emptyModulePath,
    };

    return config;
  },
  serverExternalPackages: ["@qvac/sdk"],
};

export default nextConfig;
