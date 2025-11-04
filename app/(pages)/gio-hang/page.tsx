"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/view/cart.module.scss";
import { useCart } from "@/components/common/CartProvider";
import { calculateShippingFee } from "@/shared/shipping";

const FREE_SHIP_THRESHOLD = 520_000;
const SELECTED_STORAGE_KEY = "checkoutSelectedProductIds";

export default function CartPage() {
  const { cart, isLoading, isUpdating, updateItem, removeItem } = useCart();
  const router = useRouter();
  const [country, setCountry] = useState<string>(() => {
    if (typeof window === "undefined") return "Việt Nam";
    return window.localStorage.getItem("checkoutCountry") ?? "Việt Nam";
  });
  const [selectedIds, setSelectedIds] = useState<number[] | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(SELECTED_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as number[];
      if (Array.isArray(parsed)) {
        return parsed
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value));
      }
    } catch (error) {
      console.warn("[CartPage] Unable to parse stored selections:", error);
    }
    return null;
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

  const availableSet = useMemo(() => new Set(availableIds), [availableIds]);

  const effectiveSelectedIds = useMemo(() => {
    if (availableIds.length === 0) {
      return [];
    }

    const base = selectedIds === null ? availableIds : selectedIds;
    const filtered = base.filter((id) => availableSet.has(id));

    if (filtered.length === 0 && selectedIds === null) {
      return availableIds;
    }

    return filtered;
  }, [availableIds, availableSet, selectedIds]);

  const selectedSet = useMemo(() => new Set(effectiveSelectedIds), [effectiveSelectedIds]);

  const selectedItems = useMemo(
    () => cart?.items.filter((item) => selectedSet.has(item.productId)) ?? [],
    [cart, selectedSet]
  );

  const selectedProductCount = effectiveSelectedIds.length;
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
    selectedSubtotal > 0
      ? Math.min(100, (selectedSubtotal / FREE_SHIP_THRESHOLD) * 100)
      : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      SELECTED_STORAGE_KEY,
      JSON.stringify(effectiveSelectedIds)
    );
  }, [effectiveSelectedIds]);

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const formatCurrency = useCallback(
    (value: number) => currencyFormatter.format(Math.round(value)),
    [currencyFormatter]
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

  const handleToggleItem = useCallback(
    (productId: number, checked: boolean) => {
      setSelectedIds((prev) => {
        const base =
          prev === null ? availableIds : prev.filter((id) => availableSet.has(id));
        const nextSet = new Set(base);
        if (checked) {
          nextSet.add(productId);
        } else {
          nextSet.delete(productId);
        }
        const next = Array.from(nextSet);
        if (checked && selectionError) {
          setSelectionError(null);
        }
        return next;
      });
    },
    [availableIds, availableSet, selectionError]
  );

  const handleToggleAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(Array.from(availableIds));
        if (selectionError) {
          setSelectionError(null);
        }
      } else {
        setSelectedIds([]);
      }
    },
    [availableIds, selectionError]
  );

  const handleCheckout = () => {
    if (effectiveSelectedIds.length === 0) {
      setSelectionError("Vui lòng chọn ít nhất một sản phẩm để tiếp tục.");
      return;
    }
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
                  checked={
                    availableIds.length > 0 &&
                    effectiveSelectedIds.length === availableIds.length
                  }
                  onChange={(event) => handleToggleAll(event.target.checked)}
                />
                <span>Chọn tất cả sản phẩm</span>
              </label>
              <span className={styles.selectionCount}>
                Đã chọn {selectedProductCount} sản phẩm
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
                          handleToggleItem(item.productId, event.target.checked)
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
                        {item.availableQuantity <= 0 && (
                          <span className={styles.outOfStock}>Hết hàng</span>
                        )}
                        <button
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

                    <div className={styles.quantityControl}>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.productId, item.quantity - 1)
                        }
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
                        onClick={() =>
                          handleQuantityChange(item.productId, item.quantity + 1)
                        }
                        disabled={
                          isUpdating || item.quantity >= item.maxQuantity
                        }
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
                  ? `Chi tiêu thêm ${formatCurrency(
                      remainingForFreeShip
                    )} để mở khóa giao hàng miễn phí`
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
              <label>Ghi chú đơn hàng</label>
              <textarea placeholder="Thêm hướng dẫn giao hàng hoặc tin nhắn cá nhân..." />
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
                Phí vận chuyển tạm tính:{" "}
                <strong>{formatCurrency(calculateShippingFee(country))}</strong>{" "}
                (Việt Nam: {formatCurrency(30_000)}, quốc tế: {formatCurrency(50_000)}).
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
              <span className={styles.default}>Mua ngay</span>
              <span className={styles.hover}>Mua ngay</span>
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
