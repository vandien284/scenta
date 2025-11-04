
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
  const productData = await getAllProducts();
  return (
    <PagesLayout>
      <Banner />
      <Highlight />
      <section className={styles.section}>
        <div className="container-width"  style={{ overflow: "hidden" }}>
          <ProductSlider tabs={TabsData} data={productData} />
        </div>
      </section>
      <OurStory />
      <ProductList tab={TabData} data={productData.filter(p => p.limited)} />
      <CustomerReviews />
    </PagesLayout>
  );
}
