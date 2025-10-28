"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  once?: boolean;
  direction?: "up" | "down" | "left" | "right";
  offset?: number;
}

export function ScrollReveal({
  children,
  delay = 0,
  once = true,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: `0px 0px -100px 0px` });

  const variants = {
    up: { opacity: 0, y: 40 },
    down: { opacity: 0, y: -40 },
    left: { opacity: 0, x: -40 },
    right: { opacity: 0, x: 40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={variants[direction]}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 1, 0.5, 1],
      }}
      style={{ height: "100%", display: "block", willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
