"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import styles from "@/styles/view/order-lookup.module.scss";
import { OrderSchema } from "@/types/OrderType";
import { formatCurrencyVND } from "@/utils/formatCurrency";

type OrderResult = Omit<OrderSchema, "cartIdentifier" | "verificationId">;

const initialForm = {
  code: "",
  email: "",
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatCurrency(value: number) {
  return `${formatCurrencyVND(Math.round(value))} ₫`;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function mapStatus(status: OrderResult["status"]) {
  switch (status) {
    case "confirmed":
      return "Đã xác nhận";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Đang xử lý";
  }
}

export default function OrderLookupPage() {
  const [form, setForm] = useState(initialForm);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const code = form.code.trim().toUpperCase();
    const email = normalize(form.email);

    if (!code || !email) {
      setError("Vui lòng nhập đầy đủ mã đơn và email.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(code)}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Không thể tra cứu đơn hàng.");
      }

      const result = data.order as OrderResult;
      if (normalize(result.customer.email) !== email) {
        throw new Error("Không tìm thấy đơn hàng khớp với email đã nhập.");
      }

      setOrder(result);
      setMessage("Đã tìm thấy đơn hàng của bạn.");
    } catch (lookupError) {
      setOrder(null);
      setError(
        lookupError instanceof Error ? lookupError.message : "Không thể tra cứu đơn hàng."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = useMemo(
    () => order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [order]
  );

  return (
    <section className={styles.lookupPage}>
      <div className="container-width">
        <h1>Tra cứu đơn hàng</h1>

        <div className={styles.layout}>
          <form className={styles.panel} onSubmit={handleSubmit}>
            <h2 className={styles.sectionTitle}>Nhập thông tin đơn hàng</h2>

            <div className={styles.formGrid}>
              <div className={styles.formControl}>
                <label htmlFor="orderCode">Mã đơn hàng</label>
                <input
                  id="orderCode"
                  type="text"
                  placeholder="SC-20250101-XXXX"
                  value={form.code}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      code: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className={styles.formControl}>
                <label htmlFor="orderEmail">Email</label>
                <input
                  id="orderEmail"
                  type="email"
                  placeholder="email@domain.com"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <button className={styles.primaryButton} type="submit" disabled={isLoading}>
              {isLoading ? "Đang tra cứu..." : "Tra cứu đơn hàng"}
            </button>

            {message && <p className={styles.statusMessage}>{message}</p>}
            {error && <p className={`${styles.statusMessage} ${styles.error}`}>{error}</p>}
          </form>

          <div className={styles.panel}>
            {!order ? (
              <div className={styles.emptyState}>
                Nhập mã đơn và email để xem chi tiết đơn hàng của bạn.
              </div>
            ) : (
              <div className={styles.result}>
                <header>
                  <h2>Đơn hàng #{order.code}</h2>
                  <span>Ngày đặt: {dateFormatter.format(new Date(order.createdAt))}</span>
                </header>

                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <span>Trạng thái</span>
                    <strong>{mapStatus(order.status)}</strong>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Thanh toán</span>
                    <strong>Thanh toán khi nhận hàng</strong>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Người nhận</span>
                    <strong>{order.customer.fullName}</strong>
                  </div>
                  <div className={styles.metaItem}>
                    <span>Số sản phẩm</span>
                    <strong>{itemCount}</strong>
                  </div>
                </div>

                <div>
                  <h3 className={styles.sectionTitle} style={{ marginBottom: 12 }}>
                    Sản phẩm
                  </h3>
                  <ul className={styles.itemsList}>
                    {order.items.map((item) => (
                      <li key={item.productId}>
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>{formatCurrency(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.totals}>
                  <div>
                    <span>Tạm tính</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div>
                    <span>Vận chuyển</span>
                    <span>{formatCurrency(order.shippingFee)}</span>
                  </div>
                  <div className={styles.grandTotal}>
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>

                <div className={styles.actions}>
                  <Link href="/san-pham">Tiếp tục mua sắm</Link>
                  <Link href="/lien-he">Cần hỗ trợ?</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
