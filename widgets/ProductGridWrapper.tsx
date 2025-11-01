"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import ProductGrid from "@/widgets/ProductGrid";
import Pagination from "@/ui/Pagination";
import { getProductsAction } from "@/app/actions/getProductsAction";
import { ProductType } from "@/types/ProductType";

export default function ProductGridWrapper() {
    const gridRef = useRef<HTMLDivElement>(null);

    const [page, setPage] = useState(1);
    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(1000);
    const [cateId, setCateId] = useState(0);
    const isInitialLoad = useRef(true);
    const isInternalChange = useRef(false);

    const [data, setData] = useState<ProductType[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const syncParams = () => {
            const params = new URLSearchParams(window.location.search);
            const urlPage = Number(params.get("page")) || 1;
            const urlMin = Number(params.get("priceMin")) || 0;
            const urlMax = Number(params.get("priceMax")) || 1000;
            const urlCate = Number(params.get("cateId")) || 0;

            setPage(urlPage);
            setPriceMin(urlMin);
            setPriceMax(urlMax);
            setCateId(urlCate);

            if (params.toString().length > 0) {
                window.dispatchEvent(
                    new CustomEvent("initFilter", {
                        detail: { page: urlPage, priceMin: urlMin, priceMax: urlMax, cateId: urlCate },
                    })
                );
            }
            isInitialLoad.current = true;
        };

        syncParams();
        window.addEventListener("popstate", syncParams);
        return () => window.removeEventListener("popstate", syncParams);
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            const res = await getProductsAction({ page, priceMin, priceMax, cateId });
            setData(res.products);
            setTotalPages(res.totalPages);

            if (!isInitialLoad.current && isInternalChange.current && gridRef.current) {
                requestAnimationFrame(() => {
                    const rect = gridRef.current!.getBoundingClientRect();
                    const scrollTop = window.scrollY + rect.top - 200;
                    window.scrollTo({ top: scrollTop, behavior: "smooth" });
                });
            }

            isInternalChange.current = false;
            isInitialLoad.current = false;
        };
        fetchData();
    }, [page, priceMin, priceMax, cateId]);

    useEffect(() => {
        const handlePriceChange = (e: CustomEvent<{ min: number; max: number }>) => {
            isInternalChange.current = true;
            setPriceMin(e.detail.min);
            setPriceMax(e.detail.max);
            setPage(1);
        };

        const handleCategoryChange = (e: CustomEvent<{ cateId: number }>) => {
            isInternalChange.current = true;
            setCateId(e.detail.cateId);
            setPage(1);
        };

        window.addEventListener("priceRangeChange", handlePriceChange as EventListener);
        window.addEventListener("categoryChange", handleCategoryChange as EventListener);
        return () => {
            window.removeEventListener("priceRangeChange", handlePriceChange as EventListener);
            window.removeEventListener("categoryChange", handleCategoryChange as EventListener);
        };
    }, []);

    const handleChangePage = (newPage: number) => {
        setPage(newPage);
        isInternalChange.current = true;
        const params = new URLSearchParams(window.location.search);
        params.set("page", String(newPage));
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
    };

    return (
        <Fragment>
            <div ref={gridRef}>
                <ProductGrid data={data} />
            </div>
            <Pagination
                totalPages={totalPages}
                currentPage={page}
                onChangePage={handleChangePage}
            />
        </Fragment>
    );
}
