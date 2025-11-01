import ProductSideBar from "@/widgets/ProductSideBar";
import { Metadata } from "next";
import styles from "@/styles/view/san-pham.module.scss";
import { Fragment } from "react";
import ProductGridWrapper from "@/widgets/ProductGridWrapper";
import ParallaxBackground from "@/ui/ParallaxBackground";
import Breadcrumb from "@/components/common/Breadcrumb";
import Slider from "@/ui/Slider";
import { categoriesData } from "@/data/CategoriesData";
import Image from "next/image";
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Scenta - Cửa Hàng",
    description: "Khám phá bộ sưu tập trang trí nhà cửa cao cấp tại Scenta",
  }
}

const ShopPage = async () => {
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
            <ProductSideBar />
            <div className={styles.rightContainer}>
              <ProductGridWrapper />
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

export default ShopPage;
