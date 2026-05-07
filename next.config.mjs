/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // CRITICAL: Tells Next.js to NOT bundle this package. 
  // It will be loaded natively by the server at runtime.
  experimental: {
    serverExternalPackages: ["@qvac/sdk"],
  },
};

export default nextConfig;
