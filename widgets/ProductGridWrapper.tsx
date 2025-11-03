"use client";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  useEffect,
  Fragment,
  startTransition,
} from "react";
import ProductGrid from "@/widgets/ProductGrid";
import Pagination from "@/ui/Pagination";
import { getProductsAction } from "@/app/actions/getProductsAction";
import { ProductType } from "@/types/ProductType";

export interface ProductGridWrapperHandle {
  triggerSearch: (q: string) => void;
}

interface ProductGridWrapperProps {
  onResultCount?: (count: number) => void;
}

const ProductGridWrapper = forwardRef<ProductGridWrapperHandle, ProductGridWrapperProps>(
  ({ onResultCount }, ref) => {
    const gridRef = useRef<HTMLDivElement>(null);

    const [page, setPage] = useState(1);
    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(1000);
    const [cateId, setCateId] = useState(0);
    const [q, setQ] = useState("");
    const [data, setData] = useState<ProductType[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    const isInternalChange = useRef(false);
    const isInitialLoad = useRef(true);
    const onResultCountRef = useRef(onResultCount);

    useEffect(() => {
      onResultCountRef.current = onResultCount;
    }, [onResultCount]);

    const fetchData = useCallback(
      async (
        overrides?: Partial<{
          page: number;
          priceMin: number;
          priceMax: number;
          cateId: number;
          q: string;
        }>
      ) => {
        const nextPage = overrides?.page ?? page;
        const nextPriceMin = overrides?.priceMin ?? priceMin;
        const nextPriceMax = overrides?.priceMax ?? priceMax;
        const nextCateId = overrides?.cateId ?? cateId;
        const nextQ = overrides?.q ?? q;

        const res = await getProductsAction({
          page: nextPage,
          priceMin: nextPriceMin,
          priceMax: nextPriceMax,
          cateId: nextCateId,
          q: nextQ,
        });

        setData(res.products);
        setTotalPages(res.totalPages);

        onResultCountRef.current?.(res.totalProducts);

        if (!isInitialLoad.current && isInternalChange.current && gridRef.current) {
          requestAnimationFrame(() => {
            const rect = gridRef.current!.getBoundingClientRect();
            const scrollTop = window.scrollY + rect.top - 200;
            window.scrollTo({ top: scrollTop, behavior: "smooth" });
          });
        }

        isInternalChange.current = false;
        isInitialLoad.current = false;
      },
      [q, page, priceMin, priceMax, cateId]
    );


    useEffect(() => {
      if (typeof window === "undefined") return;

      const syncParams = () => {
        const params = new URLSearchParams(window.location.search);
        const urlPage = Number(params.get("page")) || 1;
        const urlMin = Number(params.get("priceMin")) || 0;
        const urlMax = Number(params.get("priceMax")) || 1000;
        const urlCate = Number(params.get("cateId")) || 0;
        const urlQ = params.get("q") || "";

        setQ(urlQ);
        setPage(urlPage);
        setPriceMin(urlMin);
        setPriceMax(urlMax);
        setCateId(urlCate);

        window.dispatchEvent(
          new CustomEvent("initFilter", {
            detail: { cateId: urlCate, priceMin: urlMin, priceMax: urlMax },
          })
        );

        startTransition(() =>
          fetchData({
            page: urlPage,
            priceMin: urlMin,
            priceMax: urlMax,
            cateId: urlCate,
            q: urlQ,
          })
        );

        isInitialLoad.current = true;
      };

      syncParams();
      window.addEventListener("popstate", syncParams);
      return () => window.removeEventListener("popstate", syncParams);
    }, []);

    
    useImperativeHandle(ref, () => ({
      triggerSearch: (query: string) => {
        setQ(query);
        setPage(1);
        startTransition(() =>
          fetchData({
            q: query,
            page: 1,
          })
        );
      },
    }));

    useEffect(() => {
      if (isInitialLoad.current) return;
      startTransition(() => fetchData());
    }, [page, priceMin, priceMax, cateId]);

    useEffect(() => {
      const handlePriceChange = (e: CustomEvent<{ min: number; max: number }>) => {
        isInternalChange.current = true;
        setPriceMin(Number(e.detail.min));
        setPriceMax(Number(e.detail.max));
        setPage(1);
      };

      const handleCategoryChange = (e: CustomEvent<{ cateId: number }>) => {
        isInternalChange.current = true;
        setCateId(Number(e.detail.cateId));
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
      isInternalChange.current = true;
      const params = new URLSearchParams(window.location.search);
      params.set("page", String(newPage));
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, "", newUrl);
      setPage(newPage);
      startTransition(() =>
        fetchData({
          page: newPage,
        })
      );
    };

    return (
      <Fragment>
        <div ref={gridRef}>
          <ProductGrid data={data} />
        </div>
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            onChangePage={handleChangePage}
          />
        )}
      </Fragment>
    );
  }
);

ProductGridWrapper.displayName = "ProductGridWrapper";
export default ProductGridWrapper;
