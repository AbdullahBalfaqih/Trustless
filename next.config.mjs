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
      "node:fs": false,
      "node:os": false,
      "node:path": false,
      "node:process": false,
      "node:crypto": false,
      "node:child_process": false,
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
      "node:fs": { browser: "./empty-module.js" },
      "node:os": { browser: "./empty-module.js" },
      "node:path": { browser: "./empty-module.js" },
      "node:process": { browser: "./empty-module.js" },
      "node:crypto": { browser: "./empty-module.js" },
      "node:child_process": { browser: "./empty-module.js" },
    },
  },
};

export default nextConfig;
