"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import styles from "@/styles/view/cart.module.scss";
import { useCart } from "@/components/common/CartProvider";

export default function CartPage() {
  const { cart, isLoading, isUpdating, updateItem, removeItem } = useCart();

  const formatter = useMemo(
    () => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    []
  );

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

  return (
    <section className={styles.cartPage}>
      <div className="container-width">
        <h1 className={styles.heading}>Giỏ hàng của bạn</h1>

        <div className={styles.layout}>
          <div className={styles.itemsPanel}>
            <header className={styles.listHeader}>
              <span>Sản Phẩm</span>
              <span>Số lượng</span>
              <span>Tổng</span>
            </header>

            <ul className={styles.itemsList}>
              {cart.items.map((item) => (
                <li key={item.productId} className={styles.itemRow}>
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
                      <Link href={`/san-pham/${item.url}`} className={styles.productName}>
                        {item.name}
                      </Link>
                      <span className={styles.productPrice}>{formatter.format(item.price)}</span>
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
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      disabled={isUpdating || item.quantity <= 1}
                    >
                      −
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
                    {formatter.format(item.subtotal)}
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              <Link href="/san-pham">Tiếp tục mua sắm</Link>
            </div>
          </div>

          <aside className={styles.summaryPanel}>
            <div className={styles.freeShip}>
              <span>
                Chi tiêu thêm {formatter.format(Math.max(0, 520 - cart.totalPrice))} để mở khóa
                giao hàng miễn phí
              </span>
              <div className={styles.progress}>
                <div
                  className={styles.bar}
                  style={{ width: `${Math.min(100, (cart.totalPrice / 520) * 100)}%` }}
                />
              </div>
            </div>

            <div className={styles.summaryField}>
              <label>Ghi chú đơn hàng</label>
              <textarea placeholder="Thêm hướng dẫn giao hàng hoặc tin nhắn cá nhân..." />
            </div>

            <div className={styles.summaryField}>
              <label>Coupon</label>
              <input type="text" placeholder="Nhập mã coupon" />
            </div>

            <div className={styles.summaryField}>
              <label>Vận chuyển</label>
              <input type="text" placeholder="Quốc gia/khu vực" />
              <input type="text" placeholder="Mã bưu chính" />
              <button type="button" className={styles.calculateBtn}>
                <span className={styles.default}>Tính phí vận chuyển</span>
                <span className={styles.hover}>Tính phí vận chuyển</span>
              </button>
            </div>

            <div className={styles.totalRow}>
              <span>Tổng</span>
              <span>{formatter.format(cart.totalPrice)}</span>
            </div>
            <p className={styles.taxNote}>Thuế và phí vận chuyển sẽ được tính tại trang thanh toán.</p>

            <button className={styles.checkoutBtn} disabled={cart.totalQuantity === 0}>
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
