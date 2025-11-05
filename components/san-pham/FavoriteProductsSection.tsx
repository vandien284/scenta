"use client";

import Link from "next/link";
import styles from "@/styles/components/san-pham/favoritesPage.module.scss";
import { useFavorites } from "@/components/common/FavoritesProvider";
import ProductGrid from "@/widgets/ProductGrid";
import { Fragment } from "react";

export default function FavoriteProductsSection() {
  const { favorites, isLoading, isUpdating, clearFavorites } = useFavorites();
  const products = favorites?.products ?? [];
  const hasFavorites = products.length > 0;

  return (
    <section className={styles.section}>
      <div className="container-width">
        <div className={styles.header}>
          <h1 className={styles.title}>Danh sách yêu thích</h1>
          <div className={styles.actions}>
            {hasFavorites ? (
              <Fragment>
                <span className={styles.summary}>
                  Bạn có <strong>{products.length}</strong> sản phẩm yêu thích.
                </span>
                <button
                  className={styles.clearButton}
                  onClick={() => {
                    void clearFavorites();
                  }}
                  disabled={isUpdating}
                >
                  Xóa tất cả
                </button>
              </Fragment>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Đang tải danh sách yêu thích...</div>
        ) : hasFavorites ? (
          <ProductGrid data={products} />
        ) : (
          <div className={styles.placeholder}>
            Bạn chưa có sản phẩm yêu thích nào.{" "}
            <Link href="/san-pham">Khám phá sản phẩm ngay!</Link>
          </div>
        )}
      </div>
    </section>
  );
}
