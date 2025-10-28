"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "@/styles/components/home/highlight.module.scss";
import sliderStyles from "@/styles/ui/slider.module.scss";
import Slider from "@/ui/Slider";
import { highlightData } from "@/data/HighlightData";
import { ScrollReveal } from "@/ui/ScrollReveal";

export default function Highlight() {
  const [activeIndex, setActiveIndex] = useState(1);
  return (
    <section className={styles["hight-light"]}>
      <div className="container-width">
        <ScrollReveal direction="up" delay={0} once={true}>
          <div className={styles.box}>
            <div className={styles["text-column"]}>
              {highlightData.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.textItem} ${activeIndex === item.id ? styles.active : ""}`}
                >
                  <span className={styles.category}>{item.category}</span>
                  <span className={styles.title}>{item.title}</span>
                </div>
              ))}
            </div>

            <div className={styles["image-column"]}>
              <Slider
                options={{ loop: true, axis: "x", align: "start" }}
                delay={4000}
                onSelect={(i) => setActiveIndex(i)}
                showDots={false}
              >
                {highlightData.map((item) => (
                  <div key={item.id} className={sliderStyles.embla__slide}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className={styles.image}
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
