"use client";

import { ReactNode } from "react";
import { createAppKit } from "@reown/appkit/react";
import { projectId, networks } from "@/lib/web3-config";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
 
// Initialize Solana Adapter
const solanaAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
});
 
// Initialize AppKit at module level so hooks are always available
createAppKit({
  adapters: [solanaAdapter],
  projectId,
  networks,
  defaultNetwork: networks[0],
  metadata: {
    name: "TRUSTLESS",
    description: "Web3 Freelance Escrow Platform powered by AI",
    url: "https://trustless.web3",
    icons: ["https://trustless.web3/icon.png"],
  },
  features: {
    analytics: false,
    email: false,
    socials: [],
    emailShowWallets: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#ffffff",
    "--w3m-color-mix": "#000000",
    "--w3m-color-mix-strength": 40,
    "--w3m-font-family": "inherit",
    "--w3m-border-radius-master": "4px",
    "--w3m-z-index": "9999",
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
