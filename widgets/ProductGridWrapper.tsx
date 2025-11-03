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
import styles from "@/styles/widgets/productGridWrapper.module.scss";

export interface ProductGridWrapperHandle {
  triggerSearch: (q: string) => void;
}

interface ProductGridWrapperProps {
  onResultCount?: (count: number) => void;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PRICE_MIN = 0;
const DEFAULT_PRICE_MAX = 1000;
const DEFAULT_CATE_ID = 0;

const ProductGridWrapper = forwardRef<ProductGridWrapperHandle, ProductGridWrapperProps>(
  ({ onResultCount }, ref) => {
    const gridRef = useRef<HTMLDivElement>(null);

    const [page, setPage] = useState(DEFAULT_PAGE);
    const [priceMin, setPriceMin] = useState(DEFAULT_PRICE_MIN);
    const [priceMax, setPriceMax] = useState(DEFAULT_PRICE_MAX);
    const [cateId, setCateId] = useState(DEFAULT_CATE_ID);
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
        const urlPage = Number(params.get("page")) || DEFAULT_PAGE;
        const urlMin = Number(params.get("priceMin")) || DEFAULT_PRICE_MIN;
        const urlMax = Number(params.get("priceMax")) || DEFAULT_PRICE_MAX;
        const urlCateParam = params.get("cateId");
        const urlCate = urlCateParam ? Number(urlCateParam) || DEFAULT_CATE_ID : DEFAULT_CATE_ID;
        const urlQ = params.get("q") || "";

        setQ(urlQ);
        setPage(urlPage);
        setPriceMin(urlMin);
        setPriceMax(urlMax);
        setCateId(urlCate);

        window.dispatchEvent(
          new CustomEvent("initFilter", {
            detail: {
              cateId: urlCateParam ?? "",
              priceMin: urlMin,
              priceMax: urlMax,
            },
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

      const handleCategoryChange = (e: CustomEvent<{ cateId: number | string }>) => {
        isInternalChange.current = true;
        setCateId(Number(e.detail.cateId) || DEFAULT_CATE_ID);
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

    const handleClearFilters = () => {
      if (typeof window === "undefined") return;
      isInternalChange.current = true;
      const params = new URLSearchParams(window.location.search);
      params.delete("priceMin");
      params.delete("priceMax");
      params.delete("cateId");
      params.delete("page");
      const queryString = params.toString();
      const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
      window.history.pushState({}, "", newUrl);

      setPriceMin(DEFAULT_PRICE_MIN);
      setPriceMax(DEFAULT_PRICE_MAX);
      setCateId(DEFAULT_CATE_ID);
      setPage(DEFAULT_PAGE);

      window.dispatchEvent(
        new CustomEvent("initFilter", {
          detail: {
            cateId: "",
            priceMin: DEFAULT_PRICE_MIN,
            priceMax: DEFAULT_PRICE_MAX,
          },
        })
      );

      startTransition(() =>
        fetchData({
          page: DEFAULT_PAGE,
          priceMin: DEFAULT_PRICE_MIN,
          priceMax: DEFAULT_PRICE_MAX,
          cateId: DEFAULT_CATE_ID,
        })
      );
    };

    return (
      <Fragment>
        <div ref={gridRef}>
          {data.length > 0 ? (
            <ProductGrid data={data} />
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.iconWrapper}>?</div>
              <h3 className={styles.title}>Không tìm thấy sản phẩm nào</h3>
              <p className={styles.message}>
                Sử dụng ít bộ lọc hơn hoặc{" "}
                <button type="button" className={styles.clearButton} onClick={handleClearFilters}>
                  xóa tất cả
                </button>
              </p>
            </div>
          )}
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
