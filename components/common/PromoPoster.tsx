"use client";

import { startTransition, useEffect, useState } from "react";
import styles from "@/styles/components/common/promoPoster.module.scss";
import Image from "next/image";

const STORAGE_KEY = "scenta-promo-poster-dismissed";

export default function PromoPoster() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) {
      return;
    }
    const hasDismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!hasDismissed) {
      startTransition(() => {
        setIsOpen(true);
      });
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    document.body.style.overflow = "";
    return undefined;
  }, [isOpen]);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, "true");
    }
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="promo-poster-title">
      <div className={styles.dialog}>
        <button type="button" className={styles.closeButton} aria-label="Đóng" onClick={handleClose}>
          ×
        </button>
        <div className={styles.posterImage}>
          {/* <Image
            src="/images/promo/poster.jpg"
            alt="Poster khuyến mãi Scenta - giảm 25% trên toàn bộ sản phẩm"
            fill
            sizes="(max-width: 768px) 90vw, 620px"
            priority
          /> */}
        </div>
      </div>
    </div>
  );
}
