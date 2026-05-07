"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { SignupModal } from "@/components/auth/signup-modal";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

const words = ["trustless", "verified", "secured", "instant"];

function BlurWord({ word, trigger }: { word: string; trigger: number }) {
  const letters = word.split("");
  const STAGGER = 45;      // ms between each letter
  const DURATION = 500;    // blur+opacity fade duration per letter
  const GRADIENT_HOLD = STAGGER * letters.length + DURATION + 200;

  const [letterStates, setLetterStates] = useState<{ opacity: number; blur: number }[]>(
    letters.map(() => ({ opacity: 0, blur: 20 }))
  );
  const [showGradient, setShowGradient] = useState(true);
  const framesRef = useRef<number[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // reset
    framesRef.current.forEach(cancelAnimationFrame);
    timersRef.current.forEach(clearTimeout);
    framesRef.current = [];
    timersRef.current = [];

    setLetterStates(letters.map(() => ({ opacity: 0, blur: 20 })));
    setShowGradient(true);

    // stagger each letter
    letters.forEach((_, i) => {
      const t = setTimeout(() => {
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setLetterStates(prev => {
            const next = [...prev];
            next[i] = { opacity: eased, blur: 20 * (1 - eased) };
            return next;
          });
          if (progress < 1) {
            const id = requestAnimationFrame(tick);
            framesRef.current.push(id);
          }
        };
        const id = requestAnimationFrame(tick);
        framesRef.current.push(id);
      }, i * STAGGER);
      timersRef.current.push(t);
    });

    // remove gradient once all letters are settled
    const gt = setTimeout(() => setShowGradient(false), GRADIENT_HOLD);
    timersRef.current.push(gt);

    return () => {
      framesRef.current.forEach(cancelAnimationFrame);
      timersRef.current.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  // gradient colours cycling across letter positions
  const gradientColors = ["#eca8d6", "#a78bfa", "#67e8f9", "#fbbf24", "#eca8d6"];

  return (
    <>
      {letters.map((char, i) => {
        const colorIndex = (i / Math.max(letters.length - 1, 1)) * (gradientColors.length - 1);
        const lower = Math.floor(colorIndex);
        const upper = Math.min(lower + 1, gradientColors.length - 1);
        const t = colorIndex - lower;

        // lerp hex colours
        const hex2rgb = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return [r, g, b];
        };
        const [r1, g1, b1] = hex2rgb(gradientColors[lower]);
        const [r2, g2, b2] = hex2rgb(gradientColors[upper]);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: letterStates[i]?.opacity ?? 0,
              filter: `blur(${letterStates[i]?.blur ?? 20}px)`,
              color: showGradient ? `rgb(${r},${g},${b})` : "white",
              transition: "color 0.4s ease",
            }}
          >
            {char}
          </span>
        );
      })}
    </>
  );
}

export function HeroSection() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/creative");
  const [user, setUser] = useState<User | null>(null);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-start overflow-hidden bg-black">
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} redirectTo={redirectTo} />
      
      {/* Background video - Resized and aligned to the right */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 bottom-0 right-0 w-full lg:w-[45%] z-0 overflow-hidden"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="w-full h-full object-cover lg:object-fill"
        >
          <source src="/images/IMG_2511.MP4" type="video/mp4" />
        </video>
        {/* Adjusted overlay for the right-side video */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black lg:bg-gradient-to-r lg:from-black lg:via-transparent lg:to-transparent" />
      </motion.div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-white/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-white/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        <div className="lg:max-w-[55%]">
        {/* Eyebrow */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-white/60">
            <span className="w-8 h-px bg-white/30" />
            Web3 Freelance Escrow Platform powered by AI
          </span>
        </motion.div>
        
        {/* Main headline */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1 }}
            className="text-left text-[clamp(2rem,6vw,7rem)] font-display leading-[0.92] tracking-tight text-white"
          >
            <span className="block whitespace-nowrap">Trustless Freelance,</span>
            <span className="block whitespace-nowrap">
              payments{" "}
              <span className="relative inline-block">
                <BlurWord word={words[wordIndex]} trigger={wordIndex} />
              </span>
            </span>
          </motion.h1>
        </div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-wrap gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = "/creative"}
            className="px-8 py-4 bg-white text-black rounded-full font-medium text-sm transition-colors hover:bg-white/90"
          >
            Browse Opportunities
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setRedirectTo("/dashboard");
              setIsSignupOpen(true);
            }}
            className="px-8 py-4 bg-transparent text-white border border-white/20 rounded-full font-medium text-sm transition-colors"
          >
            Post Opportunity
          </motion.button>
        </motion.div>
        </div>
      </div>
      
      {/* Stats — 3 metrics static, no auto-scroll */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-12 left-0 right-0 px-6 lg:px-12"
      >
        <div className="max-w-[1400px] mx-auto flex items-start gap-10 lg:gap-20">
          {[
            { value: "$2.5M+", label: "escrowed payments" },
            { value: "99.9%", label: "AI verification accuracy" },
            { value: "0", label: "trust disputes" },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + (i * 0.1) }}
              className="flex flex-col gap-2"
            >
              <span className="text-3xl lg:text-4xl font-display text-white">{stat.value}</span>
              <span className="text-xs text-white/50 leading-tight">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scroll indicator */}

    </section>
  );
}
