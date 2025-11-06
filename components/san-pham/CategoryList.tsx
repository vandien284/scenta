"use client";

import { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import styles from "@/styles/components/san-pham/categoryList.module.scss";
import { CategoriesType } from "@/types/CategoriesType";


interface CategoryListProps {
  categories: CategoriesType[];
  active?: number | string;
  onChange?: (catId: number | string) => void;
}

export default function CategoryList({ categories, active, onChange }: CategoryListProps) {
  const [selected, setSelected] = useState(active || "");

  const handleSelect = (catId: number | string) => {
    setSelected(catId);
    onChange?.(catId);
  };

  useEffect(() => {
    const handleInitFilter = (e: CustomEvent<{ cateId: number }>) => {
      setSelected(e.detail.cateId);
    };
    window.addEventListener("initFilter", handleInitFilter as EventListener);
    return () => window.removeEventListener("initFilter", handleInitFilter as EventListener);
  }, []);

  return (
    <div className={styles.categoryList}>
      <h3 className={styles.heading}>DANH MỤC</h3>
      <ul className={styles.list}>
        <li
          className={`${styles.item} ${selected === 0 || selected === "" ? styles.active : ""}`}
          onClick={() => handleSelect("")}
        >
          <span className={styles.arrow}>
            <FaChevronRight />
          </span>
          TẤT CẢ SẢN PHẨM
        </li>
        {categories.map((cat) => (

          <li
            key={cat.id}
            className={`${styles.item} ${selected === cat.id ? styles.active : ""}`}
            onClick={() => handleSelect(cat.id)}
          >
            <span className={styles.arrow}>
              <FaChevronRight />
            </span>
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
