import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer, webpack }) => {
    // 1. Add Fallbacks for Node.js modules
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

    // 2. Block the specific problematic RPC file
    const emptyModulePath = path.resolve("./empty-module.js");
    config.resolve.alias = {
      ...config.resolve.alias,
      "@qvac/sdk/dist/client/rpc/node-rpc-client.js": emptyModulePath,
    };

    // 3. Ensure the worker can be bundled
    if (!isServer) {
      config.output.globalObject = "self";
    }

    return config;
  },
};

export default nextConfig;
