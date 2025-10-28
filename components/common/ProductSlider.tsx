"use client";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Row } from "react-bootstrap";
import Tabs from "@/ui/Tabs";
import Product from "@/ui/Product";
import Slider from "@/ui/Slider";
import { productData } from "@/data/ProductData";
import styles from "@/styles/components/home/productList.module.scss";
import sliderStyles from "@/styles/ui/slider.module.scss";
import { TabType } from "@/types/TabType";


interface ProductListProps {
  tabs: TabType[];
}

export default function ProductList({ tabs}: ProductListProps) {
  const [activeTab, setActiveTab] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 576);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const bestSeller = useMemo(
    () => productData.filter((p) => p.bestSeller),
    []
  );
  const outstanding = useMemo(
    () => productData.filter((p) => p.outstanding),
    []
  );

  const products = useMemo(() => {
    return activeTab === 1 ? bestSeller : outstanding;
  }, [activeTab, bestSeller, outstanding]);

  const slides = useMemo(() => {
    const chunkSize = isMobile ? 1 : 4;
    return Array.from({ length: Math.ceil(products.length / chunkSize) }, (_, i) =>
      products.slice(i * chunkSize, i * chunkSize + chunkSize)
    );
  }, [products, isMobile]);

  const handleTabChange = useCallback((id: number) => setActiveTab(id), []);

  return (
    <section className={styles.section}>
      <div className="container-width">
        <Tabs tabs={tabs} onChange={handleTabChange} />

        <Row className="mt-4">
          <Slider
            key={activeTab}
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
