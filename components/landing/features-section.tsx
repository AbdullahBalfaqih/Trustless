"use client";

import { useEffect, useRef, useState } from "react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion-wrapper";
import { motion } from "framer-motion";

const features = [
  {
    number: "01",
    title: "AI Verification Layer",
    description: "AI analyzes submitted work, detects quality and completion accuracy, generates automatic trust scores, and reduces disputes between users.",
    stats: { value: "99.9%", label: "accuracy rate" },
  },
  {
    number: "02",
    title: "Micro Escrow System",
    description: "Jobs split into small tasks (10-50 Palm USD). Instant escrow locking per task with fast release after approval. Ideal for micro freelance jobs.",
    stats: { value: "10-50", label: "Palm USD tasks" },
  },
  {
    number: "03",
    title: "No Signup Web3 Access",
    description: "No email, no passwords. Login via Solana wallet only. Instant access to the platform with seamless onboarding UX.",
    stats: { value: "0", label: "signups needed" },
  },
  {
    number: "04",
    title: "On-Chain Reputation",
    description: "Every transaction updates user reputation. Score stored on blockchain, visible trust level for all users. Builds credibility over time.",
    stats: { value: "100%", label: "on-chain verified" },
  },
];

// Floating dot particles visualization
function ParticleVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    // Generate stable particle positions
    const COUNT = 70;
    const particles = Array.from({ length: COUNT }, (_, i) => {
      const seed = i * 1.618;
      return {
        bx: ((seed * 127.1) % 1),
        by: ((seed * 311.7) % 1),
        phase: seed * Math.PI * 2,
        speed: 0.4 + (seed % 0.4),
        radius: 1.2 + (seed % 2.2),
      };
    });

    let time = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p) => {
        const flowX = Math.sin(time * p.speed * 0.4 + p.phase) * 38;
        const flowY = Math.cos(time * p.speed * 0.3 + p.phase * 0.7) * 24;

        const bx = p.bx * w;
        const by = p.by * h;
        const dx = p.bx - mx;
        const dy = p.by - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist * 2.8);

        const x = bx + flowX + influence * Math.cos(time + p.phase) * 36;
        const y = by + flowY + influence * Math.sin(time + p.phase) * 36;

        const pulse = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5;
        const alpha = 0.08 + pulse * 0.18 + influence * 0.3;

        ctx.beginPath();
        ctx.arc(x, y, p.radius + pulse * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      time += 0.016;
      frameRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section
      id="features"
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header - Full width with diagonal layout */}
        <div className="relative mb-24 lg:mb-32">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <FadeIn>
                <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
                  <span className="w-12 h-px bg-foreground/30" />
                  Core Features
                </span>
                <h2 className="text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9]">
                  Trustless
                  <br />
                  <span className="text-muted-foreground">payments.</span>
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-5 lg:pb-4">
              <FadeIn delay={0.2}>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Escrow-based freelance platform with AI verification and wallet-only access. No middlemen, no trust issues.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <StaggerContainer className="grid lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Large feature card */}
          <StaggerItem 
            className="lg:col-span-12 relative bg-black border border-foreground/10 min-h-[500px] overflow-hidden group flex"
            onMouseEnter={() => setActiveFeature(0)}
          >
            {/* Left: text content */}
            <div className="relative flex-1 p-8 lg:p-12 bg-black">
              <ParticleVisualization />
              <div className="relative z-10">
                <span className="font-mono text-sm text-muted-foreground">{features[0].number}</span>
                <h3 className="text-3xl lg:text-4xl font-display mt-4 mb-6 group-hover:translate-x-2 transition-transform duration-500">
                  {features[0].title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md mb-8">
                  {features[0].description}
                </p>
                <div>
                  <span className="text-5xl lg:text-6xl font-display">{features[0].stats.value}</span>
                  <span className="block text-sm text-muted-foreground font-mono mt-2">{features[0].stats.label}</span>
                </div>
              </div>
            </div>

            {/* Right: mirrored image, full height */}
            <div className="hidden lg:block relative w-[42%] shrink-0 overflow-hidden">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                src="/images/LOCK2.png"
                alt="AI Verification Security"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Fade left edge into black */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
            </div>
          </StaggerItem>

          {/* Add more StaggerItems for other features if needed, but the original code only showed one large card in the bento grid */}
          {/* I'll add the rest of the features in a smaller grid below if the original intended to show them */}
          {features.slice(1).map((feature, i) => (
            <StaggerItem 
              key={feature.number}
              className="lg:col-span-4 relative bg-black border border-foreground/10 p-8 lg:p-10 overflow-hidden group"
            >
              <div className="relative z-10">
                <span className="font-mono text-sm text-muted-foreground">{feature.number}</span>
                <h3 className="text-2xl font-display mt-4 mb-4 group-hover:translate-x-1 transition-transform duration-500">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {feature.description}
                </p>
                <div>
                  <span className="text-4xl font-display">{feature.stats.value}</span>
                  <span className="block text-xs text-muted-foreground font-mono mt-1">{feature.stats.label}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
