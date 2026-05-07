"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { SignupModal } from "@/components/auth/signup-modal";

const navLinks = [
  { name: "Browse Jobs",   href: "/creative"      },
  { name: "Features",      href: "#features"      },
  { name: "How It Works",  href: "#how-it-works"  },
  { name: "Trust System",  href: "#trust"         },
  { name: "Security",      href: "#security"      },
];

function truncate(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function ConnectButton({ variant = "default" }: { variant?: "default" | "scrolled" | "mobile" }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const label = mounted && isConnected && address
    ? truncate(address)
    : "Connect Wallet";

  const baseClass = "font-medium transition-all duration-300 cursor-pointer select-none";

  if (variant === "mobile") {
    return (
      <button
        onClick={() => open()}
        className={`${baseClass} flex-1 rounded-full bg-foreground text-background h-14 text-base`}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={() => open()}
      className={`${baseClass} rounded-full flex items-center gap-2
        ${variant === "scrolled"
          ? "bg-foreground hover:bg-foreground/90 text-background px-4 h-8 text-xs"
          : "bg-white hover:bg-white/90 text-black px-6 h-9 text-sm"}
      `}
    >
      {mounted && isConnected && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      )}
      {label}
    </button>
  );
}

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <img 
              src="/images/logo.png" 
              alt="Trustless Logo" 
              className={`transition-all duration-500 ${isScrolled ? "w-8 h-8" : "w-10 h-10"}`} 
            />
            <div className="flex items-center gap-2">
              <span className={`font-display tracking-tight transition-all duration-500 ${
                isScrolled ? "text-xl text-foreground" : "text-2xl text-white"
              }`}>
                Trustless
              </span>
              <span className={`font-mono transition-all duration-500 ${
                isScrolled ? "text-[10px] mt-0.5 text-muted-foreground" : "text-xs mt-1 text-white/60"
              }`}>
                Web3
              </span>
            </div>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors duration-300 relative group ${
                  isScrolled ? "text-foreground/70 hover:text-foreground" : "text-white/70 hover:text-white"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${
                  isScrolled ? "bg-foreground" : "bg-white"
                }`} />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link 
                href="/dashboard"
                className={`text-sm font-medium transition-all duration-300 ${
                  isScrolled ? "text-foreground hover:text-foreground/70" : "text-white hover:text-white/70"
                }`}
              >
                Dashboard
              </Link>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className={`text-sm font-medium transition-all duration-300 ${
                  isScrolled ? "text-foreground hover:text-foreground/70" : "text-white hover:text-white/70"
                }`}
              >
                Sign In
              </button>
            )}
            <ConnectButton variant={isScrolled ? "scrolled" : "default"} />
          </div>

          <SignupModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
          />

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-colors duration-500 ${
              isScrolled || isMobileMenuOpen ? "text-foreground" : "text-white"
            }`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-background z-40 transition-all duration-500 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-5xl font-display text-foreground hover:text-muted-foreground transition-all duration-500 ${
                  isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div
            className={`flex gap-4 pt-8 border-t border-foreground/10 transition-all duration-500 ${
              isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            <ConnectButton variant="mobile" />
          </div>
        </div>
      </div>
    </header>
  );
}
