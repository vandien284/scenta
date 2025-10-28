"use client";
import { ScrollReveal } from "@/ui/ScrollReveal";
import styles from "@/styles/components/common/productGrid.module.scss";
import { productData } from "@/data/ProductData";
import { ProductType } from "@/types/ProductType";
import Product from "@/ui/Product";
import Tabs from "@/ui/Tabs";
import { TabType } from "@/types/TabType";


interface ProductGridProps {
  tab?: TabType;
}

export default function ProductGrid({ tab }: ProductGridProps) {
  const chunkArray = (arr: ProductType[], size: number) =>
    arr.reduce((rows: ProductType[][], _, i) => {
      if (i % size === 0) rows.push(arr.slice(i, i + size));
      return rows;
    }, []);

  const rows = chunkArray(productData, 4);

  return (
    <section className={styles.gridWrapper}>
      <div className="container-width">
        {tab && <Tabs tabs={[tab]} />}
        <div className={styles.gridBox}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.gridRow}>
              {row.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 0.15} direction="up" once={true}>
                  <Product data={p} />
                </ScrollReveal>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
