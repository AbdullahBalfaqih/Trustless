import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/web3-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trustless | Decentralized Escrow & Talent Hub",
  description: "Secure, on-chain employment and payments on Solana.",
};

export const runtime = "nodejs";
export const maxDuration = 300;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Web3Provider>
          {children}
          <Toaster position="top-center" theme="dark" closeButton />
        </Web3Provider>
      </body>
    </html>
  );
}
