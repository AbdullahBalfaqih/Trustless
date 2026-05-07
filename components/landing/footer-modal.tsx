"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string | null;
}

const modalContent: Record<string, { title: string; content: any }> = {
  "Features": {
    title: "Platform Features",
    content: (
      <div className="space-y-6">
        <p className="text-white/40 text-sm leading-relaxed">Advanced decentralized workforce features built for scale.</p>
        <div className="space-y-4">
          {[
            "AI-Powered Escrow protection",
            "Instant PUSD settlements",
            "On-chain reputation system",
            "Multi-signature security"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-white/5 pb-3">
              <span className="text-[10px] font-mono text-white/20">0{i + 1}</span>
              <span className="text-sm tracking-wide">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  "How it works": {
    title: "System Workflow",
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {[
            { step: "01", title: "Smart Contract Deployment", desc: "Automated escrow creation per project." },
            { step: "02", title: "Asset Locking", desc: "Secure PUSD funding on the Solana network." },
            { step: "03", title: "AI Validation", desc: "Cryptographic proof of work verification." },
            { step: "04", title: "Instant Release", desc: "Immediate fund transfer upon approval." }
          ].map((s, i) => (
            <div key={i} className="p-4 border border-white/10 hover:border-white/30 transition-colors">
              <span className="text-[10px] font-mono text-white/30">{s.step}</span>
              <h4 className="text-sm font-display font-bold mt-1">{s.title}</h4>
              <p className="text-[11px] text-white/40 mt-1 tracking-tight">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    )
  },
  "Trust System": {
    title: "Trust Protocol",
    content: (
      <div className="space-y-6">
        <p className="text-white/40 text-sm">Multi-layered verification protocol for secure interactions.</p>
        <div className="p-6 border border-white/10">
          <h4 className="text-lg font-display font-bold mb-2">Proof of Work (PoW)</h4>
          <p className="text-[11px] text-white/40 leading-relaxed tracking-wide">Cryptographic work evidence stored permanently on-chain for immutable reputation scores.</p>
        </div>
        <div className="p-6 border border-white/10">
          <h4 className="text-lg font-display font-bold mb-2">Neural Dispute Resolution</h4>
          <p className="text-[11px] text-white/40 leading-relaxed tracking-wide">Data-driven arbitration handled by specialized AI models to ensure mathematically fair outcomes.</p>
        </div>
      </div>
    )
  },
  "Integrations": {
    title: "Network Ecosystem",
    content: (
      <div className="space-y-6 py-4">
        <p className="text-white/40 text-sm">Seamless connectivity with global Web3 standards.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-white/10 text-center text-[10px] tracking-widest hover:border-white/40 transition-all cursor-pointer">Solana Network</div>
          <div className="p-4 border border-white/10 text-center text-[10px] tracking-widest hover:border-white/40 transition-all cursor-pointer">Palm USD (PUSD)</div>
          <div className="p-4 border border-white/10 text-center text-[10px] tracking-widest hover:border-white/40 transition-all cursor-pointer">MetaMask SDK</div>
          <div className="p-4 border border-white/10 text-center text-[10px] tracking-widest hover:border-white/40 transition-all cursor-pointer">Phantom API</div>
        </div>
      </div>
    )
  },
  "Documentation": {
    title: "Technical Docs",
    content: (
      <div className="space-y-6">
        <p className="text-white/40 text-sm">Protocol integration specifications and guides.</p>
        <div className="space-y-2">
          {["Core SDK", "Smart Contracts", "API Endpoints", "CLI Tools"].map(item => (
            <div key={item} className="p-3 border border-white/5 text-[10px] tracking-widest hover:bg-white/5 transition-colors cursor-pointer">
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  },
  "Smart Contracts": {
    title: "Protocol Contracts",
    content: (
      <div className="space-y-4">
        <p className="text-white/40 text-sm">Open source core infrastructure and smart contracts.</p>
        <div className="space-y-2">
          {[
            { name: "EscrowCore_v1.sol", status: "Audited" },
            { name: "ReputationEngine.sol", status: "Verified" },
            { name: "GovernanceHub.sol", status: "Live" }
          ].map(c => (
            <div key={c.name} className="flex items-center justify-between p-3 border border-white/5">
              <span className="font-mono text-[10px]">{c.name}</span>
              <span className="text-[9px] border border-white/20 px-2 py-0.5">{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  "API Reference": {
    title: "API Specification",
    content: (
      <div className="space-y-6">
        <div className="p-4 bg-white/5 border border-white/10 font-mono text-[10px] overflow-hidden">
          <p className="text-white/20 mb-2">// Fetch Job Data</p>
          <p className="text-white">GET /api/v1/jobs/:id</p>
          <p className="text-white/20 my-2 mt-4">// Initialize Escrow</p>
          <p className="text-white">POST /api/v1/escrow/init</p>
        </div>
        <p className="text-[11px] text-white/40 tracking-widest">Full REST & GraphQL implementation support for developers.</p>
      </div>
    )
  },
  "Status": {
    title: "System Status",
    content: (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 border border-white/10">
          <div className="size-1.5 bg-white animate-pulse" />
          <span className="text-xs font-bold tracking-[0.2em]">Operational</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[
            { name: "API Gateway", uptime: "99.99%" },
            { name: "AI Verifier", uptime: "99.95%" },
            { name: "Solana Node", uptime: "100.00%" }
          ].map(s => (
            <div key={s.name} className="flex items-center justify-between text-[10px] py-2 border-b border-white/5 tracking-widest">
              <span className="text-white/30">{s.name}</span>
              <span className="text-white/60">{s.uptime}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  "Privacy": {
    title: "Privacy Policy",
    content: (
      <div className="space-y-6">
        <p className="text-white/40 text-sm leading-relaxed">Your data privacy is encoded into our core protocol.</p>
        <div className="space-y-4">
          {[
            "Zero-knowledge data handling",
            "Decentralized Identity (DID) support",
            "No third-party data sharing",
            "Encrypted communication channels"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-white/5 pb-3">
              <span className="text-[10px] font-mono text-white/20">0{i + 1}</span>
              <span className="text-sm tracking-wide">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  "Terms": {
    title: "Terms of Service",
    content: (
      <div className="space-y-6">
        <p className="text-white/40 text-sm leading-relaxed">Legal framework for secure trustless interactions.</p>
        <div className="p-6 border border-white/10 space-y-4">
          <p className="text-sm font-display font-medium leading-relaxed tracking-tight">By using the platform, you agree to the automated execution of smart contracts and AI-driven dispute resolution protocols as defined in the technical specification.</p>
          <p className="text-sm font-display font-medium leading-relaxed tracking-tight">Users maintain full ownership of their private keys and are responsible for all on-chain actions performed through their connected wallets.</p>
        </div>
      </div>
    )
  },
  "Security": {
    title: "Security Audit",
    content: (
      <div className="space-y-6">
        <p className="text-white/40 text-sm leading-relaxed">Enterprise-grade security standards and protocols.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 border border-white/10 text-center space-y-2">
            <p className="text-[24px] font-bold">100%</p>
            <p className="text-[9px] tracking-widest text-white/40">On-chain Verified</p>
          </div>
          <div className="p-6 border border-white/10 text-center space-y-2">
            <p className="text-[24px] font-bold">A+</p>
            <p className="text-[9px] tracking-widest text-white/40">Audit Score</p>
          </div>
        </div>
        <div 
          onClick={() => {
            toast.success("Security Report Downloaded", {
              description: "The audit report has been saved to your downloads."
            });
          }}
          className="p-4 border border-white/10 text-[10px] tracking-widest text-center hover:bg-white hover:text-black transition-colors cursor-pointer"
        >
          Download full security report (PDF)
        </div>
      </div>
    )
  }
};

export function FooterModal({ isOpen, onClose, type }: FooterModalProps) {
  if (!type || !modalContent[type]) return null;

  const content = modalContent[type];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black border border-white/10 text-white max-w-lg p-0 overflow-hidden rounded-none sm:rounded-none">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="p-10"
            >
              <DialogHeader className="flex flex-col items-start text-left mb-10">
                <DialogTitle className="text-5xl font-display font-bold tracking-tight text-white leading-[0.92]">
                  {content.title}
                </DialogTitle>
                <div className="w-16 h-0.5 bg-white mt-6" />
                <DialogDescription className="sr-only">
                  Detailed information about {content.title}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-12 font-sans">
                {content.content}
              </div>

              <DialogFooter className="mt-12 pt-8 border-t border-white/10 flex justify-end">
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  className="rounded-none hover:bg-white hover:text-black transition-all text-[11px] tracking-widest font-medium px-8 py-6"
                >
                  close [esc]
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
