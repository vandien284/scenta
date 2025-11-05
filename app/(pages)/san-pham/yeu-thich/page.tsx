import type { Metadata } from "next";
import FavoriteProductsSection from "@/components/san-pham/FavoriteProductsSection";
import Breadcrumb from "@/components/common/Breadcrumb";
import styles from "@/styles/components/san-pham/favoritesPage.module.scss";
import ParallaxBackground from "@/ui/ParallaxBackground";
import { Fragment } from "react";

export const metadata: Metadata = {
  title: "Sản phẩm yêu thích | Scenta",
  description: "Lưu trữ những sản phẩm bạn yêu thích tại Scenta.",
};

export default function FavoriteProductsPage() {
  return (
    <Fragment>
      <ParallaxBackground image="/images/parallax/banner-page.webp" height="40vh">
        <div className={styles.pageHero}>
          <Breadcrumb crumbs={[{ name: "Trang chủ", href: "/" }, { name: "Danh sách yêu thích" }]} />
        </div>
      </ParallaxBackground>
      <FavoriteProductsSection />
    </Fragment>
  );
}
