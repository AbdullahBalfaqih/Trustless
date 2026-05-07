"use client";

/**
 * Loads the QVAC SDK using standard dynamic import.
 * Since we are now forcing Webpack via --webpack, the fallbacks in next.config.mjs
 * will correctly handle Node.js dependencies without crashing the build.
 */
export async function loadQvac() {
  if (typeof window === "undefined") return null;
  
  // Back to standard dynamic import now that Webpack is forced
  const qvac = await import("@qvac/sdk");
  return qvac;
}
