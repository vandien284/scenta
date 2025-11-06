
import PagesLayout from "@/app/(pages)/layout";
import Banner from "@/components/home/Banner";
import Highlight from "@/components/home/Highlight";
import ProductSlider from "@/widgets/ProductSlider";
import ProductList from "@/components/home/ProductList";
import { TabsData } from "@/data/TabsData";
import { TabData } from "@/data/TabsData";
import OurStory from "@/components/home/OurStory";
import CustomerReviews from "@/components/home/CustomerReview";
import { getAllProducts } from "@/lib/productSource";
import styles from "@/styles/view/home.module.scss";
export default async function Home() {
  let productData: Awaited<ReturnType<typeof getAllProducts>> | null = null;

  try {
    productData = await getAllProducts();
  } catch (error) {
    console.error("[Home] Unable to load products from blob:", error);
  }

  const renderFallback = (message: string) => (
    <div className={styles.loadingFallback} role="status">
      {message}
    </div>
  );

  return (
    <PagesLayout>
      <Banner />
      <Highlight />
      <section className={styles.section}>
        <div className="container-width"  style={{ overflow: "hidden" }}>
          {productData ? (
            <ProductSlider tabs={TabsData} data={productData} />
          ) : (
            renderFallback("Đang tải dữ liệu sản phẩm...")
          )}
        </div>
      </section>
      <OurStory />
      {productData ? (
        <ProductList tab={TabData} data={productData.filter((p) => p.limited)} />
      ) : (
        <section className={styles.section}>
          <div className="container-width">
            {renderFallback("Đang tải dữ liệu sản phẩm...")}
          </div>
        </section>
      )}
      <CustomerReviews />
    </PagesLayout>
  );
}
