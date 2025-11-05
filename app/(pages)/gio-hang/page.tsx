"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "@/styles/view/cart.module.scss";
import { useCart } from "@/components/common/CartProvider";
import { calculateShippingFee } from "@/shared/shipping";
import { formatCurrencyVND } from "@/utils/formatCurrency";

const FREE_SHIP_THRESHOLD = 520_000;
const SELECTED_STORAGE_KEY = "checkoutSelectedProductIds";
const DEFAULT_COUNTRY = "Việt Nam";

function readStoredSelection(): number[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(SELECTED_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));
    }
  } catch (error) {
    console.warn("[CartPage] Unable to parse stored selection:", error);
  }
  return [];
}

export default function CartPage() {
  const { cart, isLoading, isUpdating, updateItem, removeItem } = useCart();
  const router = useRouter();
  const [country, setCountry] = useState<string>(() => {
    if (typeof window === "undefined") return DEFAULT_COUNTRY;
    return window.localStorage.getItem("checkoutCountry") ?? DEFAULT_COUNTRY;
  });
  const [selectionSource, setSelectionSource] = useState<number[] | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = readStoredSelection();
    return stored.length > 0 ? stored : null;
  });
  const [selectionTouched, setSelectionTouched] = useState(() => {
    if (typeof window === "undefined") return false;
    return readStoredSelection().length > 0;
  });
  const [selectionError, setSelectionError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("checkoutCountry", country);
  }, [country]);

  const availableIds = useMemo(
    () => cart?.items.map((item) => item.productId) ?? [],
    [cart]
  );

  const selectedIds = useMemo(() => {
    if (!cart || cart.items.length === 0) {
      return [];
    }
    const availableSet = new Set(availableIds);
    const base = selectionSource ?? availableIds;
    const filtered = base.filter((id) => availableSet.has(id));
    if (filtered.length > 0) {
      return filtered;
    }
    return selectionTouched ? [] : availableIds;
  }, [availableIds, cart, selectionSource, selectionTouched]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selectionTouched) return;
    window.localStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds, selectionTouched]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedItems = useMemo(
    () => cart?.items.filter((item) => selectedSet.has(item.productId)) ?? [],
    [cart, selectedSet]
  );
  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.subtotal, 0),
    [selectedItems]
  );
  const selectedQuantity = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedItems]
  );

  const shippingFee = useMemo(
    () => (selectedItems.length > 0 ? calculateShippingFee(country) : 0),
    [country, selectedItems.length]
  );
  const totalWithShipping = selectedSubtotal + shippingFee;
  const remainingForFreeShip = Math.max(0, FREE_SHIP_THRESHOLD - selectedSubtotal);
  const progress =
    selectedSubtotal > 0 ? Math.min(100, (selectedSubtotal / FREE_SHIP_THRESHOLD) * 100) : 0;

  const formatCurrency = useCallback(
    (value: number) => `${formatCurrencyVND(Math.round(value))} ₫`,
    []
  );

  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      void removeItem(productId).catch((error) =>
        console.error("[CartPage] remove error:", error)
      );
    } else {
      void updateItem(productId, quantity).catch((error) =>
        console.error("[CartPage] update error:", error)
      );
    }
  };

  const toggleSelection = useCallback(
    (productId: number, checked: boolean) => {
      setSelectionSource((prev) => {
        const base = prev ?? selectedIds;
        const nextSet = new Set(base);
        if (checked) {
          nextSet.add(productId);
        } else {
          nextSet.delete(productId);
        }
        return Array.from(nextSet);
      });
      setSelectionTouched(true);
      if (checked && selectionError) {
        setSelectionError(null);
      }
    },
    [selectedIds, selectionError]
  );

  const toggleAllSelection = useCallback(
    (checked: boolean, allIds: number[]) => {
      setSelectionSource(checked ? allIds : []);
      setSelectionTouched(true);
      if (checked && selectionError) {
        setSelectionError(null);
      }
    },
    [selectionError]
  );

  const ensureCheckoutDefaults = useCallback((ids: number[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify(ids));
    window.localStorage.setItem("checkoutCountry", DEFAULT_COUNTRY);
  }, []);

  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      setSelectionError("Vui lòng chọn ít nhất một sản phẩm để tiếp tục.");
      return;
    }
    ensureCheckoutDefaults(selectedIds);
    router.push("/thanh-toan");
  };

  const handleBuyNow = (productId: number) => {
    ensureCheckoutDefaults([productId]);
    setSelectionSource([productId]);
    setSelectionTouched(true);
    setSelectionError(null);
    router.push("/thanh-toan");
  };

  if (isLoading && !cart) {
    return (
      <div className={styles.loadingState}>
        <p>Đang tải giỏ hàng của bạn...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h1>Giỏ hàng của bạn</h1>
        <p>Bạn chưa thêm sản phẩm nào.</p>
        <Link href="/san-pham" className={styles.cta}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <section className={styles.cartPage}>
      <div className="container-width">
        <h1 className={styles.heading}>Giỏ hàng của bạn</h1>

        <div className={styles.layout}>
          <div className={styles.itemsPanel}>
            <div className={styles.selectAllRow}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === cart.items.length}
                  onChange={(event) => toggleAllSelection(event.target.checked, availableIds)}
                />
                <span>Chọn tất cả sản phẩm</span>
              </label>
              <span className={styles.selectionCount}>
                Đã chọn {selectedIds.length} sản phẩm
              </span>
            </div>

            <header className={styles.listHeader}>
              <span />
              <span>Sản phẩm</span>
              <span>Số lượng</span>
              <span>Tổng</span>
            </header>

            <ul className={styles.itemsList}>
              {cart.items.map((item) => {
                const checked = selectedSet.has(item.productId);
                return (
                  <li key={item.productId} className={styles.itemRow}>
                    <div className={styles.selectCell}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          toggleSelection(item.productId, event.target.checked)
                        }
                      />
                    </div>
                    <div className={styles.productInfo}>
                      {item.image && (
                        <div className={styles.thumbnail}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={72}
                            height={72}
                          />
                        </div>
                      )}
                      <div className={styles.productMeta}>
                        <Link
                          href={`/san-pham/${item.url}`}
                          className={styles.productName}
                        >
                          {item.name}
                        </Link>
                        <span className={styles.productPrice}>
                          {formatCurrency(item.price)}
                        </span>
                        <div className={styles.metaActions}>
                          <button
                            type="button"
                            className={styles.buyNowInline}
                            onClick={() => handleBuyNow(item.productId)}
                            disabled={isUpdating}
                          >
                            Mua ngay
                          </button>
                          <button
                            type="button"
                            className={styles.removeButton}
                            onClick={() =>
                              void removeItem(item.productId).catch((error) =>
                                console.error("[CartPage] remove error:", error)
                              )
                            }
                            disabled={isUpdating}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={styles.quantityControl}>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={isUpdating || item.quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={item.quantity}
                        onChange={(event) => {
                          const digits = event.target.value.replace(/\D/g, "");
                          const nextQuantity = digits ? Number(digits) : 0;
                          handleQuantityChange(item.productId, nextQuantity);
                        }}
                        disabled={isUpdating || item.maxQuantity <= 0}
                      />
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={isUpdating || item.quantity >= item.maxQuantity}
                      >
                        +
                      </button>
                    </div>

                    <div className={styles.itemTotal}>
                      {formatCurrency(item.subtotal)}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className={styles.actions}>
              <Link href="/san-pham">Tiếp tục mua sắm</Link>
            </div>
          </div>

          <aside className={styles.summaryPanel}>
            <div className={styles.freeShip}>
              <span>
                {selectedSubtotal === 0
                  ? "Hãy chọn sản phẩm để tính khuyến mãi giao hàng."
                  : remainingForFreeShip > 0
                    ? `Chi tiêu thêm ${formatCurrency(remainingForFreeShip)} để mở khóa giao hàng miễn phí`
                    : "Bạn đã đạt mức giao hàng miễn phí!"}
              </span>
              <div className={styles.progress}>
                <div
                  className={styles.bar}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className={styles.summaryField}>
              <label>Quốc gia nhận hàng</label>
              <select
                value={country}
                onChange={(event) => setCountry(event.target.value)}
              >
                <option value="Việt Nam">Việt Nam</option>
                <option value="Vietnam">Vietnam</option>
                <option value="VN">VN</option>
                <option value="Khác">Quốc gia khác</option>
              </select>
              <p className={styles.shippingHint}>
                Phí vận chuyển tạm tính: <strong>{formatCurrency(calculateShippingFee(country))}</strong> (Việt Nam: {formatCurrency(30_000)}, quốc tế: {formatCurrency(50_000)}).
              </p>
            </div>

            <div className={styles.selectionHint}>
              {selectedItems.length === 0
                ? "Bạn chưa chọn sản phẩm nào."
                : `Đang tính cho ${selectedQuantity} sản phẩm đã chọn.`}
            </div>

            <div className={styles.totalRow}>
              <span>Tạm tính</span>
              <span>{formatCurrency(selectedSubtotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Phí vận chuyển</span>
              <span>{formatCurrency(shippingFee)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Tổng cộng</span>
              <span>{formatCurrency(totalWithShipping)}</span>
            </div>
            <p className={styles.taxNote}>
              Phí vận chuyển và tổng thanh toán sẽ được xác nhận lại tại trang thanh toán.
            </p>

            {selectionError && (
              <p className={styles.selectionError}>{selectionError}</p>
            )}

            <button
              className={styles.checkoutBtn}
              disabled={isUpdating || selectedItems.length === 0}
              onClick={handleCheckout}
            >
              <span className={styles.default}>Thanh toán</span>
              <span className={styles.hover}>Thanh toán</span>
            </button>

            <div className={styles.paymentLogos}>
              <span>Chúng tôi chấp nhận</span>
              <div className={styles.brands}>
                <span>VISA</span>
                <span>Mastercard</span>
                <span>AMEX</span>
                <span>JCB</span>
                <span>PayPal</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
