"use client";

import type React from "react";
import { useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Crown, Shield, Sparkles } from "lucide-react";

interface MemberCardProps {
  name?: string;
  plan?: string;
  memberId?: string;
  memberSince?: string;
  videosRemaining?: number;
  className?: string;
}

export function MemberCard({
  name = "Usuário Viralize",
  plan = "Pro",
  memberId = "VRL-2026-00481",
  memberSince = "Fev 2026",
  videosRemaining = 12,
  className,
}: MemberCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-150, 150], [12, -12]);
  const rotateY = useTransform(mouseX, [-150, 150], [-12, 12]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative cursor-pointer select-none",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        perspective: 800,
      }}
    >
      <motion.div
        className="relative w-[380px] rounded-2xl overflow-hidden border border-border/50"
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          height: isExpanded ? 320 : 220,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-card" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" />

        {/* Holographic shimmer effect */}
        <motion.div
          className="absolute inset-0 opacity-0"
          animate={{ opacity: isHovered ? 0.15 : 0 }}
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, hsl(263 70% 58% / 0.4) 45%, hsl(280 80% 65% / 0.3) 50%, transparent 70%)",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <defs>
            <pattern id="memberGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#memberGrid)" />
        </svg>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Crown className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-display text-xs font-semibold tracking-widest uppercase text-primary">
                  Viralize AI
                </p>
                <p className="text-[10px] text-muted-foreground tracking-wider">
                  MEMBRO OFICIAL
                </p>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[10px] font-medium text-primary">
                {plan}
              </span>
            </div>
          </div>

          {/* Middle - Name & ID */}
          <div>
            <p className="font-display text-xl font-bold tracking-tight text-foreground">
              {name}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {memberId}
            </p>

            {/* Animated underline */}
            <motion.div
              className="h-px mt-3 rounded-full gradient-primary"
              animate={{ width: isHovered ? "100%" : "40%" }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Expanded details */}
          <motion.div
            initial={false}
            animate={{
              opacity: isExpanded ? 1 : 0,
              height: isExpanded ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-4 pt-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Plano</p>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3 text-primary" />
                  {plan}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Membro desde</p>
                <p className="text-sm font-semibold text-foreground">{memberSince}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vídeos</p>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  {videosRemaining}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bottom row */}
          <div className="flex items-end justify-between">
            <p className="text-[10px] text-muted-foreground">
              Desde {memberSince}
            </p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-3 rounded-full bg-primary/30"
                  animate={{
                    height: isHovered ? [12, 18, 12] : 12,
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: isHovered ? Infinity : 0,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Click hint */}
      <motion.p
        className="text-[10px] text-muted-foreground text-center mt-2"
        animate={{ opacity: isHovered ? 1 : 0 }}
      >
        Clique para {isExpanded ? "recolher" : "expandir"}
      </motion.p>
    </motion.div>
  );
}
