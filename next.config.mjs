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
    config.resolve.fallback = {
      ...config.resolve.fallback,
      child_process: path.resolve("./empty-module.js"),
      fs: path.resolve("./empty-module.js"),
      os: path.resolve("./empty-module.js"),
      path: path.resolve("./empty-module.js"),
      process: path.resolve("./empty-module.js"),
      crypto: path.resolve("./empty-module.js"),
      net: path.resolve("./empty-module.js"),
      tls: path.resolve("./empty-module.js"),
      dns: path.resolve("./empty-module.js"),
      url: path.resolve("./empty-module.js"),
      "node:fs": path.resolve("./empty-module.js"),
      "node:os": path.resolve("./empty-module.js"),
      "node:path": path.resolve("./empty-module.js"),
      "node:process": path.resolve("./empty-module.js"),
      "node:crypto": path.resolve("./empty-module.js"),
      "node:child_process": path.resolve("./empty-module.js"),
      "node:net": path.resolve("./empty-module.js"),
      "node:tls": path.resolve("./empty-module.js"),
      "node:dns": path.resolve("./empty-module.js"),
      "node:url": path.resolve("./empty-module.js"),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      child_process: { browser: path.resolve("./empty-module.js") },
      fs: { browser: path.resolve("./empty-module.js") },
      os: { browser: path.resolve("./empty-module.js") },
      path: { browser: path.resolve("./empty-module.js") },
      process: { browser: path.resolve("./empty-module.js") },
      crypto: { browser: path.resolve("./empty-module.js") },
      net: { browser: path.resolve("./empty-module.js") },
      tls: { browser: path.resolve("./empty-module.js") },
      dns: { browser: path.resolve("./empty-module.js") },
      url: { browser: path.resolve("./empty-module.js") },
      "node:fs": { browser: path.resolve("./empty-module.js") },
      "node:os": { browser: path.resolve("./empty-module.js") },
      "node:path": { browser: path.resolve("./empty-module.js") },
      "node:process": { browser: path.resolve("./empty-module.js") },
      "node:crypto": { browser: path.resolve("./empty-module.js") },
      "node:child_process": { browser: path.resolve("./empty-module.js") },
      "node:net": { browser: path.resolve("./empty-module.js") },
      "node:tls": { browser: path.resolve("./empty-module.js") },
      "node:dns": { browser: path.resolve("./empty-module.js") },
      "node:url": { browser: path.resolve("./empty-module.js") },
    },
  },
  serverExternalPackages: ["@qvac/sdk"],
};

export default nextConfig;
