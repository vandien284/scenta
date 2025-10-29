
import PagesLayout from "@/app/(pages)/layout";
import Banner from "@/components/home/Banner";
import Highlight from "@/components/home/Highlight";
import ProductSlider from "@/widgets/ProductSlider";
import ProductGrid from "@/widgets/ProductGrid";
import { TabsData } from "@/data/TabsData";
import { TabData } from "@/data/TabsData";
import OurStory from "@/components/home/OurStory";
import CustomerReviews from "@/components/home/CustomerReview";
import { productData } from "@/data/ProductData";

export default function Home() {
  return (
    <PagesLayout>
      <Banner />
      <Highlight />
      <ProductSlider tabs={TabsData} dataBestSeller={productData.filter(p => p.bestSeller)} dataOutstanding={productData.filter(p => p.outstanding)} />
      <OurStory />
      <ProductGrid tab={TabData} data={productData.filter(p => p.limited)} />
      <CustomerReviews />
    </PagesLayout>
  );
}