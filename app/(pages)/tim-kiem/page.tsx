"use client";
import { Fragment, Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import { Button } from "react-bootstrap";
import styles from "@/styles/view/tim-kiem.module.scss";
import ProductSideBar from "@/widgets/ProductSideBar";
import ProductGridWrapper, {
    ProductGridWrapperHandle,
} from "@/widgets/ProductGridWrapper";
import FullScreenModal from "@/ui/FullScreenModal";

const SearchContent = () => {
    const searchParams = useSearchParams();

    const [openFilter, setOpenFilter] = useState(false);
    const [results, setResults] = useState<number | null>(null); 


    const queryFromParam = useMemo(() => searchParams.get("q") || "", [searchParams]);
    const [query, setQuery] = useState(queryFromParam);

    const gridRef = useRef<ProductGridWrapperHandle>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const qTrim = query.trim();
        const params = new URLSearchParams(window.location.search);

        if (qTrim) params.set("q", qTrim);
        else params.delete("q");

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);

        setResults(null);

        gridRef.current?.triggerSearch(qTrim);
    };

    const handleResultCount = (count: number) => {
        setResults(count);
    };

    return (
        <Fragment>
            <section className={styles.searchPage}>
                <div className="container-width">
                    <div className={styles.searchContainer}>
                        <h1 className={styles.title}>Tìm kiếm sản phẩm</h1>
                        <div className={styles.formContainer}>
                            <form className={styles.searchForm} onSubmit={handleSearch}>
                                <input
                                    type="text"
                                    placeholder="Nhập tên sản phẩm cần tìm..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button type="submit">
                                    <FaSearch />
                                </button>
                            </form>
                        </div>


                        {results !== null && (
                            <>
                                {results && results > 0 ? (
                                    <p className={styles.resultText}>
                                        {results} kết quả cho từ khóa “{query}”
                                    </p>
                                ) : (
                                    <p className={styles.noResultText}>
                                        Không tìm thấy kết quả nào cho “{query}”. Kiểm tra chính tả hoặc sử dụng một từ hoặc cụm từ khác.
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    <div
                        className={styles.shopContent}
                        style={{ display: results && results > 0 ? "flex" : "none" }}
                    >
                        <div className={styles.desktopSidebar}>
                            <ProductSideBar />
                        </div>

                        <Button
                            className={styles.filterButton}
                            onClick={() => setOpenFilter(true)}
                        >
                            <IoFilter className={styles.filterIcon} />
                            <span>Bộ lọc</span>
                        </Button>

                        <div className={styles.rightContainer}>
                            <ProductGridWrapper
                                ref={gridRef}
                                onResultCount={handleResultCount}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <FullScreenModal
                isOpen={openFilter}
                onClose={() => setOpenFilter(false)}
                title="Bộ lọc"
            >
                <ProductSideBar />
            </FullScreenModal>
        </Fragment>
    );
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="loading">Đang tải trang tìm kiếm...</div>}>
      <SearchContent />
    </Suspense>
  );
}