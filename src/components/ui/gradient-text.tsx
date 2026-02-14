"use client";
import React from "react";
import { motion, MotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

interface GradientTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

function GradientText({
  className,
  children,
  as: Component = "span",
  ...props
}: GradientTextProps) {
  const MotionComponent = motion.create(Component);

  return (
    <MotionComponent
      className={cn(
        "relative inline-flex bg-clip-text text-transparent animate-[gradient-shift_6s_ease-in-out_infinite]",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(90deg, hsl(var(--color-1)), hsl(var(--color-2)), hsl(var(--color-3)), hsl(var(--color-4)), hsl(var(--color-1)))",
        backgroundSize: "300% 100%",
      }}
      {...props}
    >
      {children}
    </MotionComponent>
  );
}

export { GradientText };
