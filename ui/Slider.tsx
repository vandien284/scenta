"use client";
import { ReactNode, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import styles from "@/styles/ui/slider.module.scss";

interface UISliderProps {
  children?: ReactNode;
  delay?: number;
  options?: EmblaOptionsType;
  onSelect?: (index: number) => void;
  showDots?: boolean;
}

export interface SliderRef {
  scrollTo: (index: number) => void;
}

const Slider = forwardRef<SliderRef, UISliderProps>(
  ({ children, delay = 4000, options, onSelect, showDots = false }, ref) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(options, [
      Autoplay({ delay, stopOnInteraction: false }),
    ]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    useEffect(() => {
      if (!emblaApi) return;

      const handleSelect = () => {
        const index = emblaApi.selectedScrollSnap();
        setSelectedIndex(index);
        onSelect?.(index);
      };

      setScrollSnaps(emblaApi.scrollSnapList());
      emblaApi.on("select", handleSelect);
      handleSelect();

      return () => {
        emblaApi.off("select", handleSelect);
      };
    }, [emblaApi, onSelect]);

    useImperativeHandle(ref, () => ({
      scrollTo: (index: number) => {
        if (emblaApi) emblaApi.scrollTo(index);
      },
    }));

    return (
      <div className={styles.embla}>
        <div className={styles["embla__viewport"]} ref={emblaRef}>
          <div className={styles["embla__container"]}>{children}</div>
        </div>

        {showDots && (
          <div className={styles["embla__dots"]}>
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`${styles["embla__dot"]} ${
                  index === selectedIndex ? styles["is-selected"] : ""
                }`}
                onClick={() => emblaApi?.scrollTo(index)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider"; // cần cho forwardRef
export default Slider;
