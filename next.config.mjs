import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // 1. Force absolute path for the empty module
    const emptyModulePath = path.resolve("./empty-module.js");

    // 2. Global Fallbacks
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      "node:fs": false,
      "node:path": false,
      "node:os": false,
    };

    // 3. The "Nuclear" Alias: Block the specific Node RPC file causing the trace
    config.resolve.alias = {
      ...config.resolve.alias,
      // Target the EXACT relative path used by the SDK internal imports
      "@qvac/sdk/dist/client/rpc/node-rpc-client.js": emptyModulePath,
      "#rpc": emptyModulePath, 
    };

    // 4. Force externals for anything that might still sneak through
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        {
          "node:os": "undefined",
          "node:path": "undefined",
          "node:fs": "undefined",
        },
      ];
    }

    return config;
  },
};

export default nextConfig;
