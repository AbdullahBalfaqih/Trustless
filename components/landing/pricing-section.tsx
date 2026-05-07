"use client";
 
import { useState } from "react";
import { ArrowRight, Check, Zap } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token";
 
const PUSD_MINT = "CZzgUBvxaMLwMhVSLgqJn3npmxoTo6nzMNQPAnwtHF3s";
const RECIPIENT_WALLET = "7nG8YBSpycbqLLhAEmjFmbgR12XcsSu51hUB3FJZs56Q";
 
const plans = [
  {
    name: "Starter",
    description: "For freelancers just getting started",
    price: { monthly: 0, annual: 0 },
    features: [
      "0% platform fee",
      "Up to 500 PUSD/month volume",
      "AI verification included",
      "Basic reputation score",
      "Community support",
    ],
    cta: "Connect wallet",
    highlight: false,
  },
  {
    name: "Pro",
    description: "For active freelancers and clients",
    price: { monthly: 9, annual: 9 },
    features: [
      "1% platform fee",
      "Unlimited transaction volume",
      "Priority AI verification",
      "Verified Pro badge",
      "Priority dispute resolution",
      "Advanced analytics",
      "API access",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    description: "For agencies and large teams",
    price: { monthly: null, annual: null },
    features: [
      "Custom fee structure",
      "White-label solution",
      "Dedicated support",
      "Custom smart contracts",
      "Team management",
      "Volume discounts",
      "Priority verification",
      "SLA guarantee",
    ],
    cta: "Contact us",
    highlight: false,
  },
];
 
export function PricingSection() {
  const [isAnnual] = useState(true);
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("solana");
 
  const handleUpgrade = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      open();
      return;
    }
 
    const loadingToast = toast.loading("Preparing transaction...");
 
    try {
      const connection = new Connection("https://solana-mainnet.g.alchemy.com/v2/M4BKhA00BaMrQdNd3Ea4A");
      const fromWallet = new PublicKey(address);
      const toWallet = new PublicKey(RECIPIENT_WALLET);
      const mint = new PublicKey(PUSD_MINT);
 
      // 1. Get Mint Info to detect decimals automatically
      const mintInfo = await connection.getParsedAccountInfo(mint);
      // @ts-ignore
      const decimals = mintInfo.value?.data?.parsed?.info?.decimals ?? 6;
      console.log(`Detected decimals: ${decimals}`);
 
      // 2. Get associated token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(mint, fromWallet);
      const toTokenAccount = await getAssociatedTokenAddress(mint, toWallet);
 
      // 3. Check User's PUSD Balance before proceeding
      try {
        const balanceInfo = await connection.getTokenAccountBalance(fromTokenAccount);
        const currentBalance = balanceInfo.value.uiAmount || 0;
        
        if (currentBalance < 9) {
          toast.dismiss(loadingToast);
          toast.error("Insufficient PUSD Balance", {
            description: `You have ${currentBalance} PUSD, but 9 PUSD is required.`,
          });
          return;
        }
      } catch (e) {
        toast.dismiss(loadingToast);
        toast.error("PUSD Balance Error", {
          description: "Could not verify PUSD balance. Please ensure you have PUSD in your wallet.",
        });
        return;
      }
 
      const transaction = new Transaction();
 
      // 4. Check if recipient's token account exists
      try {
        await getAccount(connection, toTokenAccount);
      } catch (e) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            fromWallet,
            toTokenAccount,
            toWallet,
            mint
          )
        );
      }
 
      // Amount: 9 PUSD with correct decimals
      const amount = 9 * Math.pow(10, decimals);
 
      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          fromWallet,
          amount
        )
      );
 
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromWallet;
 
      // Sign and send
      // @ts-ignore
      const signature = await walletProvider.sendTransaction(transaction, connection);
      
      toast.dismiss(loadingToast);
      toast.success("Payment successful!", {
        description: `Transaction confirmed on Solana.`,
        action: {
          label: "View",
          onClick: () => window.open(`https://solscan.io/tx/${signature}`, "_blank"),
        },
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.dismiss(loadingToast);
      
      const errorMsg = error.message || "";
      
      // If user simply rejected the request, don't show an error toast
      if (errorMsg.includes("rejected") || errorMsg.includes("User rejected")) {
        return;
      }
      
      let displayMsg = errorMsg || "Transaction was rejected or failed.";
      if (displayMsg.includes("insufficient funds")) {
        displayMsg = "Insufficient SOL for transaction fees.";
      }
      
      toast.error("Payment failed", {
        description: displayMsg,
      });
    }
  };
 
  const handleAction = (plan: any) => {
    if (plan.name === "Starter") {
      open();
    } else if (plan.name === "Pro") {
      handleUpgrade();
    } else if (plan.name === "Enterprise") {
      window.location.href = "mailto:abdullahbalfaqih0@gmail.com?subject=Enterprise Inquiry - Trustless Platform&body=Hello, I would like to discuss the Enterprise plan.";
    }
  };
 
  return (
    <section id="pricing" className="relative py-32 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header - Dramatic offset */}
        <div className="grid lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-7">
            <FadeIn>
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-8">
                <span className="w-12 h-px bg-foreground/30" />
                Pricing
              </span>
              <h2 className="text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9]">
                Simple
                <br />
                <span className="text-stroke">pricing.</span>
              </h2>
            </FadeIn>
          </div>
          
          <div className="lg:col-span-5 relative p-0 h-96 lg:h-auto">
            {/* Whale image */}
            <FadeIn delay={0.2} className="absolute inset-0 pointer-events-none">
              <motion.img
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 1, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                src="/images/whale.png"
                alt="Organic whale"
                className="w-full h-full object-contain object-center"
              />
            </FadeIn>
          </div>
        </div>
 
        {/* Pricing cards - Horizontal layout with overlap */}
        <div className="relative">
          <StaggerContainer className="grid lg:grid-cols-3 gap-4 lg:gap-0 auto-rows-fr">
            {plans.map((plan, index) => (
              <StaggerItem
                key={plan.name}
                className={`relative bg-background border transition-all duration-700 flex flex-col ${
                  plan.highlight 
                    ? "border-foreground lg:-mx-2 lg:z-10 lg:scale-105 shadow-2xl" 
                    : "border-foreground/10 lg:first:-mr-2 lg:last:-ml-2"
                }`}
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  {/* Popular badge */}
                  {plan.highlight && (
                    <div className="absolute -top-4 left-8 right-8 flex justify-center">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-widest">
                        Most Popular
                      </span>
                    </div>
                  )}
 
                  <div className="p-8 lg:p-10 flex flex-col h-full">
                    {/* Plan header */}
                    <div className="mb-8 pb-8 border-b border-foreground/10">
                      <span className="font-mono text-xs text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-2xl lg:text-3xl font-display mt-2">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                    </div>
 
                    {/* Price */}
                    <div className="mb-8">
                      {plan.price.monthly !== null ? (
                        <div className="flex items-center gap-1.5">
                          <img 
                            src="/images/blacklogo-removebg-preview.png" 
                            alt="PUSD" 
                            className="w-14 h-14 object-contain filter brightness-0 invert"
                          />
                          <div className="flex items-baseline gap-1">
                            <span className="text-6xl lg:text-7xl font-display leading-none">
                              {plan.name === "Pro" ? "9" : (isAnnual ? plan.price.annual : plan.price.monthly)}
                            </span>
                            <span className="text-muted-foreground text-[10px] font-mono self-end pb-1 opacity-60">PUSD/month</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-14 flex items-center">
                          <span className="text-4xl font-display">Custom</span>
                        </div>
                      )}
                    </div>
 
                    {/* Features */}
                    <ul className="space-y-3 mb-10 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
 
                    {/* CTA */}
                    <button
                      onClick={() => handleAction(plan)}
                      className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all group mt-auto ${
                        plan.highlight
                          ? "bg-foreground text-background hover:bg-foreground/90"
                          : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
 
        {/* Bottom note with icons */}
        <FadeIn delay={0.5} className="mt-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-12 border-t border-foreground/10">
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Smart contract secured
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              AI verification included
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              Palm USD payments
            </span>
          </div>
          <a href="#" className="text-sm underline underline-offset-4 hover:text-foreground transition-colors">
            Compare all features
          </a>
        </FadeIn>
      </div>
 
      <style jsx>{`
        .text-stroke {
          -webkit-text-stroke: 1.5px currentColor;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </section>
  );
}
