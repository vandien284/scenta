"use client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "@/styles/ui/parallaxContainer.module.scss";

interface ParallaxContainerProps {
  image: string;
  height?: string;
  children?: React.ReactNode;
}

export default function ParallaxContainer({
  image,
  height = "60vh",
  children,
}: ParallaxContainerProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 30,
    mass: 1,
  });

  const y = useTransform(smoothProgress, [0, 1], ["-30%", "30%"]);

  return (
    <section ref={ref} className={styles.section} style={{ height }}>
      <motion.div
        className={styles.background}
        style={{
          backgroundImage: `url(${image})`,
          y,
        }}
      />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className="container-width">
          {children}
        </div>
      </div>
    </section>
  );
}
