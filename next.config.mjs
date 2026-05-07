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
    // Simplify fallbacks: using the 'eval' trick in lib/qvac-client.ts 
    // already prevents the bundler from scanning the SDK.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      os: false,
      stream: false,
      url: false,
    };
    return config;
  },
  // Keep serverExternalPackages to ensure @qvac/sdk is handled correctly
  serverExternalPackages: ["@qvac/sdk"],
};

export default nextConfig;
