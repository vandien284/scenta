
import PagesLayout from "@/app/(pages)/layout";
import Banner from "@/components/home/Banner";
import Highlight from "@/components/home/Highlight";
import ProductSlider from "@/components/common/ProductSlider";
import ProductGrid from "@/components/common/ProductGrid";
import { TabsData } from "@/data/TabsData";
import { TabData } from "@/data/TabsData";
import OurStory from "@/components/home/OurStory";
import CustomerReviews from "@/components/home/CustomerReview";

export default function Home() {


  return (
    <PagesLayout>
      <Banner />
      <Highlight />
      <ProductSlider tabs={TabsData} />
      <OurStory />
      <ProductGrid tab={TabData} />
      <CustomerReviews />
    </PagesLayout>
  );
}