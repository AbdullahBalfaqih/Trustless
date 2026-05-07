"use client";

/**
 * Loads the QVAC SDK using eval('import') to bypass Next.js static analysis.
 * This prevents the bundler from trying to resolve Node.js dependencies at build time.
 */
export async function loadQvac() {
  if (typeof window === "undefined") return null;
  
  // The 'eval' trick hides the dynamic import from Webpack/Turbopack static scanners
  const qvac = await eval('import("@qvac/sdk")');
  return qvac;
}
