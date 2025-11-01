"use client";
import styles from "@/styles/components/home/productList.module.scss";

import { ProductType } from "@/types/ProductType";
import Tabs from "@/ui/Tabs";
import { TabType } from "@/types/TabType";
import ProductGrid from "@/widgets/ProductGrid";


interface ProductListProps {
  tab?: TabType;
  data: ProductType[];
}

export default function ProductList({ tab, data }: ProductListProps) {
  return (
    <section className={styles.gridWrapper}>
      <div className="container-width">
        {tab && <Tabs tabs={tab} />}
        <ProductGrid data={data} />
      </div>
    </section>
  );
}
