import path from "path";
import webpack from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    const emptyModulePath = path.resolve("./empty-module.js");

    // 1. Broad Fallbacks
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

    // 2. Precise Aliases for the actual files
    config.resolve.alias = {
      ...config.resolve.alias,
      // Target the exact file that '#rpc' resolves to by default
      [path.resolve("node_modules/@qvac/sdk/dist/client/rpc/node-rpc-client.js")]: emptyModulePath,
      [path.resolve("node_modules/@qvac/sdk/dist/client/rpc/bare-client.js")]: emptyModulePath,
    };

    // 3. NormalModuleReplacementPlugin: The most reliable way to intercept '#rpc'
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /#rpc/,
        emptyModulePath
      )
    );

    return config;
  },
};

export default nextConfig;
