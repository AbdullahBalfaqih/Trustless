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
    // 1. Core Fallbacks
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
      http: false,
      https: false,
      zlib: false,
      "node:fs": false,
      "node:path": false,
      "node:os": false,
      "node:crypto": false,
      "node:stream": false,
      "node:url": false,
      "node:net": false,
      "node:tls": false,
      "node:dns": false,
      "node:child_process": false,
      "node:http": false,
      "node:https": false,
      "node:zlib": false,
    };

    // 2. Force alias Node-specific files to an empty module to prevent deep crawling
    const emptyModulePath = path.resolve("./empty-module.js");
    config.resolve.alias = {
      ...config.resolve.alias,
      "node-rpc-client": emptyModulePath,
      "./node-rpc-client": emptyModulePath,
    };

    return config;
  },
  serverExternalPackages: ["@qvac/sdk"],
};

export default nextConfig;
