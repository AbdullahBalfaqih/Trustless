import { solana, solanaDevnet, solanaTestnet } from "@reown/appkit/networks";

// Get your projectId at https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "737f00676a08688849b25126839b1e9b";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [solana];
