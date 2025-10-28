"use client";
import ParallaxBackground from "@/ui/ParallaxBackground";
import styles from "@/styles/components/home/ourStrory.module.scss";

export default function OurStrory() {
  return (
    <ParallaxBackground image="/images/parallax/ourstory.webp" height="60vh">
     
      <div className={styles.story}>
          <h2 className={styles.title}>OUR STORY</h2>
          <div className={styles.line}></div>
          <p className={styles.desc}>
            Our story starts with a commitment to quality. We use only the finest natural ingredients,
            ensuring that every candle is hand-poured with care and attention to detail.
            Our dedication to sustainability means we choose eco-friendly materials,
            including soy wax and reusable containers, to create products that are kind
            to both you and the planet.
          </p>
          <button className={styles.btn}>
            <span className={styles.default}>READ MORE</span>
            <span className={styles.hover}>READ MORE</span>
          </button>

        </div>

    </ParallaxBackground>
  );
}

