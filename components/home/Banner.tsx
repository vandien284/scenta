"use client";
import { useState } from "react";
import styles from "@/styles/components/home/banner.module.scss";
import Link from "next/link";
import { categoriesData } from "@/data/CategoriesData";
export default function Banner() {
  const [bgImage, setBgImage] = useState("/images/banner/banner-desktop.webp");


  const handleHover = (image: string) => {
    if (window.innerWidth > 576) {
      setBgImage(image);
    }

  };

  const handleLeave = () => {
    if (window.innerWidth > 576) {
      setBgImage("/images/banner/banner-desktop.webp");
    }
  };
  return (
    <section className={styles.banner}>
      <div
        className={styles.bg}
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className={styles.overlay}>
        <div className="container-width">
          <div className={styles.grid}>
            {categoriesData.map((cat) => (
              <Link href="/abc" key={cat.id} passHref className={styles.card}
                style={{
                  "--bg-image": `url(${cat.image})`,
                  "--hover-bg-color": `${cat.hoverBgColor || "rgba(255, 255, 255, 0.3)"}`

                } as React.CSSProperties}>
                <div
                  onMouseEnter={() => handleHover(cat.image)}
                  onMouseLeave={handleLeave}
                  className={styles.info}
                >
                  <div>
                    <h3 className={styles.title}>{cat.name}</h3>
                    <p className={styles.items}>{cat.items} sản phẩm</p>
                  </div>

                  <div className={styles["view-collection"]}>
                    <span>Xem Bộ Sưu Tập</span>
                  </div>
                </div>

              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
