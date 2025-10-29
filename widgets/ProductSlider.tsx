"use client";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Row } from "react-bootstrap";
import Tabs from "@/ui/Tabs";
import Product from "@/widgets/Product";
import Slider, { SliderRef } from "@/ui/Slider";
import styles from "@/styles/widgets/productSlider.module.scss";
import sliderStyles from "@/styles/ui/slider.module.scss";
import { TabType } from "@/types/TabType";
import { ProductType } from "@/types/ProductType";

interface ProductListProps {
  tabs: TabType[];
  dataBestSeller: ProductType[];
  dataOutstanding: ProductType[];
}

export default function ProductList({
  tabs,
  dataBestSeller,
  dataOutstanding,
}: ProductListProps) {
  const [activeTab, setActiveTab] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const sliderRef = useRef<SliderRef>(null);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 576);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const products = useMemo(() => {
    if (activeTab === 1) return dataBestSeller;
    if (activeTab === 2) return dataOutstanding;
    return [];
  }, [activeTab, dataBestSeller, dataOutstanding]);

  const slides = useMemo(() => {
    const chunkSize = isMobile ? 1 : 4;
    return Array.from({ length: Math.ceil(products.length / chunkSize) }, (_, i) =>
      products.slice(i * chunkSize, i * chunkSize + chunkSize)
    );
  }, [products, isMobile]);

  const handleTabChange = useCallback((id: number) => {
    setActiveTab(id);
    sliderRef.current?.scrollTo(0);
  }, []);

  return (
    <section className={styles.section}>
      <div className="container-width">
        <Tabs tabs={tabs} onChange={handleTabChange} />

        <Row className="mt-4">
          <Slider
            ref={sliderRef}
            options={{
              loop: false,
              align: "start",
              axis: "x",
              containScroll: "trimSnaps",
              skipSnaps: true,
              dragFree: true,
            }}
            delay={6000}
            showDots={!isMobile}
          >
            {slides.map((group, idx) => (
              <div key={idx} className={sliderStyles.embla__slide}>
                <div className={styles.productRow}>
                  {group.map((p) => (
                    <Product key={p.id} data={p} />
                  ))}
                </div>
              </div>
            ))}
          </Slider>
        </Row>
      </div>
    </section>
  );
}
