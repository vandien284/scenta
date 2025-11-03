import { Fragment } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ParallaxBackground from "@/ui/ParallaxBackground";
import GiftGuideForm from "@/components/gift/GiftGuideForm";

const GiftGuidePage = () => {
  return (
    <Fragment>
      <ParallaxBackground image="/images/parallax/banner-page.webp" height="50vh">
        <Breadcrumb
          crumbs={[
            { name: "Trang chủ", href: "/" },
            { name: "Gợi ý quà tặng" },
          ]}
        />
      </ParallaxBackground>
      <section>
        <GiftGuideForm />
      </section>
    </Fragment>
  );
};

export default GiftGuidePage;
