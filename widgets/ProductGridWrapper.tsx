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
import { FiChevronDown } from "react-icons/fi";

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
const DEFAULT_SORT = "" as const;

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "", label: "Mặc định" },
  { value: "name-asc", label: "Tên A → Z" },
  { value: "name-desc", label: "Tên Z → A" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
];

interface SortDropdownProps {
  sort: SortOption;
  onChange: (value: SortOption) => void;
}

const ProductGridWrapper = forwardRef<ProductGridWrapperHandle, ProductGridWrapperProps>(
  ({ onResultCount }, ref) => {
    const gridRef = useRef<HTMLDivElement>(null);

    const [page, setPage] = useState(DEFAULT_PAGE);
    const [priceMin, setPriceMin] = useState(DEFAULT_PRICE_MIN);
    const [priceMax, setPriceMax] = useState(DEFAULT_PRICE_MAX);
    const [cateId, setCateId] = useState(DEFAULT_CATE_ID);
    const [q, setQ] = useState("");
    const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
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
          sort: SortOption;
        }>
      ) => {
        const nextPage = overrides?.page ?? page;
        const nextPriceMin = overrides?.priceMin ?? priceMin;
        const nextPriceMax = overrides?.priceMax ?? priceMax;
        const nextCateId = overrides?.cateId ?? cateId;
        const nextQ = overrides?.q ?? q;
        const nextSort = overrides?.sort ?? sort;

        const res = await getProductsAction({
          page: nextPage,
          priceMin: nextPriceMin,
          priceMax: nextPriceMax,
          cateId: nextCateId,
          q: nextQ,
          sort: nextSort || undefined,
          itemsPerPage: 20,
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
      [q, page, priceMin, priceMax, cateId, sort]
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
        const urlSortParam = (params.get("sort") as SortOption | null) ?? DEFAULT_SORT;
        const urlSort = (urlSortParam && ["name-asc", "name-desc", "price-asc", "price-desc"].includes(urlSortParam))
          ? urlSortParam
          : DEFAULT_SORT;

        setQ(urlQ);
        setPage(urlPage);
        setPriceMin(urlMin);
        setPriceMax(urlMax);
        setCateId(urlCate);
        setSort(urlSort);

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
            sort: urlSort,
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
            sort,
          })
        );
      },
    }));

    useEffect(() => {
      if (isInitialLoad.current) return;
      startTransition(() => fetchData());
    }, [page, priceMin, priceMax, cateId, sort]);

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

    const handleChangeSort = (value: SortOption) => {
      if (sort === value) return;
      isInternalChange.current = true;
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set("sort", value);
      } else {
        params.delete("sort");
      }
      params.set("page", "1");
      const queryString = params.toString();
      const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
      window.history.pushState({}, "", newUrl);

      setSort(value);
      setPage(1);
      startTransition(() =>
        fetchData({
          sort: value,
          page: 1,
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
      params.delete("sort");
      const queryString = params.toString();
      const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
      window.history.pushState({}, "", newUrl);

      setPriceMin(DEFAULT_PRICE_MIN);
      setPriceMax(DEFAULT_PRICE_MAX);
      setCateId(DEFAULT_CATE_ID);
      setPage(DEFAULT_PAGE);
      setSort(DEFAULT_SORT);

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
          sort: DEFAULT_SORT,
        })
      );
    };

    return (
      <Fragment>
        <div ref={gridRef}>
          <SortDropdown sort={sort} onChange={handleChangeSort} />
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

function SortDropdown({ sort, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const activeOption = SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];

  return (
    <div className={styles.toolbar}>
      <div className={styles.sortContainer} ref={containerRef}>
        <button
          type="button"
          className={`${styles.sortTrigger} ${isOpen ? styles.sortTriggerOpen : ""}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={styles.sortLabel}>{activeOption.label}</span>
          <FiChevronDown className={styles.sortChevron} />
        </button>
        {isOpen && (
          <div className={styles.dropdown} role="listbox" aria-label="Sắp xếp theo">
            <div className={styles.dropdownTitle}>Sắp xếp theo</div>
            {SORT_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value || "default"}
                className={`${styles.dropdownButton} ${
                  option.value === sort ? styles.dropdownButtonActive : ""
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={option.value === sort}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
