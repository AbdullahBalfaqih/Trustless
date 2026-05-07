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
    // Total Fallback for ALL Node.js built-ins to ensure compatibility in browser builds
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
      buffer: false,
      util: false,
      events: false,
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
      "node:buffer": false,
      "node:util": false,
      "node:events": false,
    };
    return config;
  },
  // Essential for allowing serverless environments to handle the package correctly
  serverExternalPackages: ["@qvac/sdk"],
};

export default nextConfig;
