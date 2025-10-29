"use client";
import { ScrollReveal } from "@/ui/ScrollReveal";
import styles from "@/styles/widgets/productGrid.module.scss";

import { ProductType } from "@/types/ProductType";
import Product from "@/widgets/Product";
import Tabs from "@/ui/Tabs";
import { TabType } from "@/types/TabType";


interface ProductGridProps {
  tab?: TabType;
  data: ProductType[];
}

export default function ProductGrid({ tab, data }: ProductGridProps) {
  const chunkArray = (arr: ProductType[], size: number) =>
    arr.reduce((rows: ProductType[][], _, i) => {
      if (i % size === 0) rows.push(arr.slice(i, i + size));
      return rows;
    }, []);

  const rows = chunkArray(data, 4);

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
