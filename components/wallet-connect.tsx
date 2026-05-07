"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, Loader2, CheckCircle2, AlertCircle, Copy, LogOut, ExternalLink } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WalletOption {
  id: string;
  name: string;
  icon: string; // SVG string
  description: string;
  isInstalled: () => boolean;
  connect: () => Promise<string>;
  chainLabel?: string;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const MetaMaskIcon = () => (
  <svg viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
    <path d="M32.9583 1L19.8242 10.7183L22.2665 4.99099L32.9583 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25"/>
    <path d="M2.04834 1L15.0666 10.809L12.7402 4.99099L2.04834 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M28.2292 23.5334L24.7346 28.872L32.2179 30.9324L34.3703 23.6501L28.2292 23.5334Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M0.641602 23.6501L2.78224 30.9324L10.2656 28.872L6.77097 23.5334L0.641602 23.6501Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M9.89829 14.5149L7.80444 17.6507L15.2211 17.9841L14.9627 9.97534L9.89829 14.5149Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M25.108 14.5149L19.9603 9.88379L19.7852 17.9841L27.2018 17.6507L25.108 14.5149Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M10.2657 28.872L14.7554 26.7033L10.8802 23.7001L10.2657 28.872Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
    <path d="M20.2446 26.7033L24.7344 28.872L24.1199 23.7001L20.2446 26.7033Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
  </svg>
);

const PhantomIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
    <rect width="40" height="40" rx="12" fill="#AB9FF2"/>
    <path d="M8 20.5C8 14.148 13.148 9 19.5 9H22C28.627 9 34 14.373 34 21C34 27.627 28.627 33 22 33H20.5C14.148 33 9 27.852 9 21.5" fill="white"/>
    <path d="M14 20C14 17.791 15.791 16 18 16H20C22.209 16 24 17.791 24 20C24 22.209 22.209 24 20 24H18C15.791 24 14 22.209 14 20Z" fill="#AB9FF2"/>
    <circle cx="18.5" cy="20" r="1.5" fill="white"/>
    <circle cx="25.5" cy="20" r="1.5" fill="white"/>
    <path d="M24 20C24 17.791 25.791 16 28 16H29C31.209 16 33 17.791 33 20C33 22.209 31.209 24 29 24H28C25.791 24 24 22.209 24 20Z" fill="#AB9FF2"/>
  </svg>
);

const CoinbaseIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
    <rect width="40" height="40" rx="12" fill="#0052FF"/>
    <circle cx="20" cy="20" r="12" fill="white"/>
    <rect x="15" y="17" width="10" height="6" rx="3" fill="#0052FF"/>
  </svg>
);

const BraveIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
    <rect width="40" height="40" rx="12" fill="#FB542B"/>
    <path d="M28 14L30 18L27 22L29 26L24 30L20 28L16 30L11 26L13 22L10 18L12 14L20 10L28 14Z" fill="white"/>
    <path d="M20 14L24 20L20 24L16 20L20 14Z" fill="#FB542B"/>
  </svg>
);

// ─── Wallet Definitions ───────────────────────────────────────────────────────
const createWallets = (): WalletOption[] => [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "metamask",
    description: "Connect using browser extension",
    chainLabel: "Ethereum · EVM",
    isInstalled: () => typeof window !== "undefined" && !!(window as any).ethereum?.isMetaMask,
    connect: async () => {
      const eth = (window as any).ethereum;
      if (!eth) throw new Error("MetaMask not installed");
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      if (!accounts[0]) throw new Error("No account returned");
      return accounts[0];
    },
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: "phantom",
    description: "Solana wallet in your browser",
    chainLabel: "Solana",
    isInstalled: () => typeof window !== "undefined" && !!(window as any).solana?.isPhantom,
    connect: async () => {
      const sol = (window as any).solana;
      if (!sol) throw new Error("Phantom not installed");
      const resp = await sol.connect();
      return resp.publicKey.toString();
    },
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "coinbase",
    description: "Connect via Coinbase Wallet extension",
    chainLabel: "Multi-chain",
    isInstalled: () => typeof window !== "undefined" && !!(window as any).coinbaseWalletExtension,
    connect: async () => {
      const cb = (window as any).ethereum;
      if (!cb) throw new Error("Coinbase Wallet not installed");
      const accounts: string[] = await cb.request({ method: "eth_requestAccounts" });
      return accounts[0];
    },
  },
  {
    id: "brave",
    name: "Brave Wallet",
    icon: "brave",
    description: "Built-in Brave browser wallet",
    chainLabel: "Ethereum · EVM",
    isInstalled: () => typeof window !== "undefined" && !!(window as any).ethereum?.isBraveWallet,
    connect: async () => {
      const eth = (window as any).ethereum;
      if (!eth) throw new Error("Brave Wallet not found");
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      return accounts[0];
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function truncateAddress(address: string) {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function WalletIcon({ id }: { id: string }) {
  switch (id) {
    case "metamask": return <MetaMaskIcon />;
    case "phantom": return <PhantomIcon />;
    case "coinbase": return <CoinbaseIcon />;
    case "brave": return <BraveIcon />;
    default: return null;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
import { createContext, useContext } from "react";

interface WalletContextValue {
  address: string | null;
  walletId: string | null;
  isConnected: boolean;
  disconnect: () => void;
}

export const WalletContext = createContext<WalletContextValue>({
  address: null,
  walletId: null,
  isConnected: false,
  disconnect: () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);

  // Persist session
  useEffect(() => {
    const saved = sessionStorage.getItem("wallet_address");
    const savedId = sessionStorage.getItem("wallet_id");
    if (saved && savedId) { setAddress(saved); setWalletId(savedId); }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setWalletId(null);
    sessionStorage.removeItem("wallet_address");
    sessionStorage.removeItem("wallet_id");
    // disconnect Phantom if connected
    if (typeof window !== "undefined" && (window as any).solana?.isPhantom) {
      (window as any).solana.disconnect().catch(() => {});
    }
  }, []);

  return (
    <WalletContext.Provider value={{ address, walletId, isConnected: !!address, disconnect }}>
      {children}
      {/* Hidden connector to push updates */}
      <WalletStateSync setAddress={setAddress} setWalletId={setWalletId} />
    </WalletContext.Provider>
  );
}

// Internal sync component
function WalletStateSync({
  setAddress,
  setWalletId,
}: {
  setAddress: (a: string | null) => void;
  setWalletId: (id: string | null) => void;
}) {
  useEffect(() => {
    const handler = (e: Event) => {
      const { address, walletId } = (e as CustomEvent).detail;
      setAddress(address);
      setWalletId(walletId);
      sessionStorage.setItem("wallet_address", address);
      sessionStorage.setItem("wallet_id", walletId);
    };
    window.addEventListener("wallet:connected", handler);
    return () => window.removeEventListener("wallet:connected", handler);
  }, [setAddress, setWalletId]);
  return null;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function WalletConnectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    setWallets(createWallets());
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  async function handleConnect(wallet: WalletOption) {
    if (!wallet.isInstalled()) {
      // Redirect to install page
      const installUrls: Record<string, string> = {
        metamask: "https://metamask.io/download/",
        phantom: "https://phantom.app/",
        coinbase: "https://www.coinbase.com/wallet/downloads",
        brave: "https://brave.com/wallet/",
      };
      window.open(installUrls[wallet.id], "_blank");
      return;
    }

    setConnectingId(wallet.id);
    setStatus("connecting");
    setErrorMsg("");

    try {
      const address = await wallet.connect();
      setStatus("success");
      // Emit event for context
      window.dispatchEvent(
        new CustomEvent("wallet:connected", { detail: { address, walletId: wallet.id } })
      );
      setTimeout(() => { onClose(); setStatus("idle"); setConnectingId(null); }, 1200);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message ?? "Connection rejected");
      setTimeout(() => { setStatus("idle"); setConnectingId(null); }, 2500);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-white font-display text-lg tracking-tight">Connect Wallet</h2>
            <p className="text-white/40 text-xs mt-0.5 font-mono">Choose your preferred provider</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wallet List */}
        <div className="px-4 py-3 space-y-2">
          {wallets.map((wallet) => {
            const installed = wallet.isInstalled();
            const isConnecting = connectingId === wallet.id && status === "connecting";
            const isSuccess = connectingId === wallet.id && status === "success";
            const isError = connectingId === wallet.id && status === "error";

            return (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet)}
                disabled={status === "connecting"}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all duration-200 group
                  ${isSuccess ? "border-green-500/40 bg-green-500/5" :
                    isError ? "border-red-500/40 bg-red-500/5" :
                    "border-white/8 hover:border-white/20 hover:bg-white/[0.04] bg-white/[0.02]"}
                  ${status === "connecting" && connectingId !== wallet.id ? "opacity-40 cursor-not-allowed" : ""}
                `}
              >
                {/* Icon */}
                <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5">
                  <WalletIcon id={wallet.id} />
                </div>

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{wallet.name}</span>
                    {installed ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        INSTALLED
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/30 border border-white/10">
                        GET
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5 truncate">
                    {isError ? errorMsg : wallet.chainLabel ?? wallet.description}
                  </p>
                </div>

                {/* Status icon */}
                <div className="shrink-0">
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isError ? (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  ) : installed ? (
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5">
          <p className="text-white/25 text-[11px] text-center font-mono leading-relaxed">
            By connecting, you agree to our Terms of Service. <br />
            We never store your private keys.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function WalletConnectButton({
  variant = "default",
  size = "default",
}: {
  variant?: "default" | "scrolled" | "mobile";
  size?: "default" | "sm";
}) {
  const { address, walletId, isConnected, disconnect } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = () => setShowDropdown(false);
    setTimeout(() => window.addEventListener("click", handler), 0);
    return () => window.removeEventListener("click", handler);
  }, [showDropdown]);

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
          className={`flex items-center gap-2.5 rounded-full border transition-all duration-300 font-mono
            ${variant === "scrolled" || variant === "mobile"
              ? "bg-foreground/5 border-foreground/20 text-foreground hover:bg-foreground/10 px-3 h-8 text-xs"
              : "bg-white/10 border-white/20 text-white hover:bg-white/20 px-4 h-9 text-xs"}
          `}
        >
          {/* Wallet icon indicator */}
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          {truncateAddress(address)}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div
            className="absolute right-0 top-full mt-2 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-0.5">Connected</p>
              <p className="text-white text-sm font-mono truncate">{truncateAddress(address)}</p>
            </div>
            <div className="p-1.5 space-y-0.5">
              <button
                onClick={copyAddress}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy Address"}
              </button>
              <button
                onClick={disconnect}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not connected
  const baseClasses = "rounded-full font-medium transition-all duration-300";

  if (variant === "mobile") {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`${baseClasses} flex-1 bg-foreground text-background h-14 text-base`}
        >
          Connect Wallet
        </button>
        <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${baseClasses}
          ${variant === "scrolled"
            ? "bg-foreground hover:bg-foreground/90 text-background px-4 h-8 text-xs"
            : "bg-white hover:bg-white/90 text-black px-6 h-9 text-sm"}
        `}
      >
        Connect Wallet
      </button>
      <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
