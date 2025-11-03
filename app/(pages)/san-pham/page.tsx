"use client";

import { Fragment, useState } from "react";
import ProductSideBar from "@/widgets/ProductSideBar";
import ProductGridWrapper from "@/widgets/ProductGridWrapper";
import ParallaxBackground from "@/ui/ParallaxBackground";
import Breadcrumb from "@/components/common/Breadcrumb";
import Slider from "@/ui/Slider";
import FullScreenModal from "@/ui/FullScreenModal";
import styles from "@/styles/view/product.module.scss";
import { categoriesData } from "@/data/CategoriesData";
import Image from "next/image";
import { IoFilter } from "react-icons/io5";
import { Button } from "react-bootstrap";

export default function ShopPage() {
  const [openFilter, setOpenFilter] = useState(false);

  return (
    <Fragment>
      <ParallaxBackground image="/images/parallax/banner-page.webp" height="70vh">
        <div className={styles.pageHero}>
          <Breadcrumb crumbs={[{ name: "Trang chủ", href: "/" }, { name: "Sản phẩm" }]} />
          <div className={styles.sliderContainer}>
            <Slider options={{ loop: true, axis: "x", align: "start" }} showDots={false} showNav={true} delay={0}>
              {categoriesData.map((cate) => (
                <div key={cate.id} className={styles.categorySlide}>
                  <div className={styles.categoryCircle}>
                    <Image
                      src={cate.image}
                      alt={cate.name}
                      width={140}
                      height={140}
                      className={styles.categoryImage}
                    />
                  </div>
                  <p className={styles.categoryName}>{cate.name}</p>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </ParallaxBackground>

      <section className={styles.shopPage}>
        <div className="container-width">
          <div className={styles.shopContent}>
            <div className={styles.desktopSidebar}>
              <ProductSideBar />
            </div>

            <Button className={styles.filterButton} onClick={() => setOpenFilter(true)}>
              <IoFilter className={styles.filterIcon} />
              <span>Bộ lọc</span>
            </Button>

            <div className={styles.rightContainer}>
              <ProductGridWrapper/>
            </div>
          </div>
        </div>
      </section>

      <FullScreenModal isOpen={openFilter} onClose={() => setOpenFilter(false)} title="Bộ lọc">
        <ProductSideBar />
      </FullScreenModal>
    </Fragment>
  );
}
