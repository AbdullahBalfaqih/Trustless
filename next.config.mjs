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
      child_process: false,
      fs: false,
      os: false,
      path: false,
      process: false,
      crypto: false,
      net: false,
      tls: false,
      dns: false,
      "node:fs": false,
      "node:os": false,
      "node:path": false,
      "node:process": false,
      "node:crypto": false,
      "node:child_process": false,
      "node:net": false,
      "node:tls": false,
      "node:dns": false,
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      child_process: { browser: "./empty-module.js" },
      fs: { browser: "./empty-module.js" },
      os: { browser: "./empty-module.js" },
      path: { browser: "./empty-module.js" },
      process: { browser: "./empty-module.js" },
      crypto: { browser: "./empty-module.js" },
      net: { browser: "./empty-module.js" },
      tls: { browser: "./empty-module.js" },
      dns: { browser: "./empty-module.js" },
      "node:fs": { browser: "./empty-module.js" },
      "node:os": { browser: "./empty-module.js" },
      "node:path": { browser: "./empty-module.js" },
      "node:process": { browser: "./empty-module.js" },
      "node:crypto": { browser: "./empty-module.js" },
      "node:child_process": { browser: "./empty-module.js" },
      "node:net": { browser: "./empty-module.js" },
      "node:tls": { browser: "./empty-module.js" },
      "node:dns": { browser: "./empty-module.js" },
    },
  },
  serverExternalPackages: ["@qvac/sdk"],
};

export default nextConfig;
