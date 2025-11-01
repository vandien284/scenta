"use client";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "@/styles/ui/pagination.module.scss";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onChangePage: (page: number) => void;
}

export default function Pagination({
  totalPages,
  currentPage,
  onChangePage,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.pagination}>
      {currentPage > 1 && (
        <button
          className={`${styles.page} ${styles.prev}`}
          onClick={() => onChangePage(currentPage - 1)}
        >
          <FaChevronLeft />
        </button>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onChangePage(page)}
          className={`${styles.page} ${page === currentPage ? styles.active : ""
            }`}
        >
          {page}
        </button>
      ))}

      {currentPage < totalPages && (
        <button
          className={`${styles.page} ${styles.next}`}
          onClick={() => onChangePage(currentPage + 1)}
        >
          <FaChevronRight />
        </button>
      )}
    </div>
  );
}
