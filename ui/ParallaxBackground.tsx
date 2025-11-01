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

  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 30 })
  const y = useTransform(smooth, [0, 1], ["0%", "30%"]);

  return (
    <section ref={ref} className={styles.section} style={{ height }}>
      <motion.div
        className={styles.background}
        style={{
          backgroundImage: `url(${image})`,
          y,
        }}
      >
      </motion.div>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className="container-width">
          {children}
        </div>
      </div>
    </section>
  );
}
