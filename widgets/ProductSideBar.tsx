"use client";

import CategoryList from "@/components/san-pham/CategoryList";
import PriceRange from "@/components/san-pham/PriceRange";
import UISideBar from "@/ui/SideBar";
import { categoriesData } from "@/data/CategoriesData";
import { Fragment } from "react";

const ProductSideBar = () => {
  const handlePriceChange = (values: [number, number]) => {
    const [min, max] = values;
    const params = new URLSearchParams(window.location.search);
    params.set("priceMin", String(min));
    params.set("priceMax", String(max));
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
    window.dispatchEvent(new CustomEvent("priceRangeChange", { detail: { min, max } }));
  };

  const handleCategoriesChange = (catId: number | string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("cateId", String(catId));
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);

    window.dispatchEvent(new CustomEvent("categoryChange", { detail: { cateId: catId } }));
  };

  return (
    <Fragment>
      <UISideBar>
        <CategoryList categories={categoriesData} onChange={handleCategoriesChange} />
        <PriceRange min={0} max={1000} step={10} onChange={handlePriceChange} />
      </UISideBar>
    </Fragment>
  );
};

export default ProductSideBar;
