"use client";

import { ReactNode } from "react";
import styles from "@/styles/ui/fullscreenModal.module.scss";
import { FaTimes } from "react-icons/fa";

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function FullScreenModal({ isOpen, onClose, children, title }: FullScreenModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{title || "Bộ lọc"}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}
