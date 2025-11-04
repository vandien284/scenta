"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "@/styles/view/checkout.module.scss";
import { useCart } from "@/components/common/CartProvider";
import { calculateShippingFee } from "@/shared/shipping";
import { OrderSchema } from "@/types/OrderType";

type CheckoutFormFields = {
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  country: string;
  city: string;
  postalCode: string;
  notes: string;
};

type VerificationStatus = "idle" | "sent" | "verified";

type SanitizedOrder = Omit<OrderSchema, "cartIdentifier" | "verificationId">;

const SELECTED_STORAGE_KEY = "checkoutSelectedProductIds";

const initialForm: CheckoutFormFields = {
  fullName: "",
  phone: "",
  email: "",
  addressLine: "",
  country: "Việt Nam",
  city: "",
  postalCode: "",
  notes: "",
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(Math.round(value));
}

export default function CheckoutPage() {
  const { cart, isLoading, refresh } = useCart();
  const [form, setForm] = useState<CheckoutFormFields>(initialForm);
  const [paymentMethod] = useState<"cod">("cod");
  const [selectedProductIds, setSelectedProductIds] = useState<number[] | null>(null);

  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationExpiry, setVerificationExpiry] = useState<number | null>(null);

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<SanitizedOrder | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedCountry = window.localStorage.getItem("checkoutCountry");
    if (storedCountry) {
      setForm((prev) => ({
        ...prev,
        country: storedCountry,
      }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("checkoutCountry", form.country);
  }, [form.country]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(SELECTED_STORAGE_KEY);
    if (!raw) {
      setSelectedProductIds(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as number[];
      if (Array.isArray(parsed)) {
        const filtered = parsed
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value));
        setSelectedProductIds(filtered);
      } else {
        setSelectedProductIds(null);
      }
    } catch (error) {
      console.warn("[CheckoutPage] Unable to parse selected items:", error);
      setSelectedProductIds(null);
    }
  }, []);

  const effectiveSelectedIds = useMemo(() => {
    if (!cart) return [];
    const available = new Set(cart.items.map((item) => item.productId));
    const base =
      selectedProductIds === null ? Array.from(available) : selectedProductIds;
    const filtered: number[] = [];
    for (const value of base) {
      const id = Number(value);
      if (Number.isFinite(id) && available.has(id)) {
        filtered.push(id);
      }
    }
    return filtered;
  }, [cart, selectedProductIds]);

  const selectedSet = useMemo(() => new Set(effectiveSelectedIds), [effectiveSelectedIds]);

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
    () => (selectedItems.length > 0 ? calculateShippingFee(form.country) : 0),
    [form.country, selectedItems.length]
  );

  const total = selectedSubtotal + shippingFee;

  const handleFieldChange =
    (field: keyof CheckoutFormFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (field === "email") {
        setVerificationId(null);
        setVerificationStatus("idle");
        setVerificationMessage(null);
        setVerificationError(null);
        setVerificationCode("");
        setVerificationExpiry(null);
      }
    };

  const handleSendCode = async () => {
    if (!form.email) {
      setVerificationError("Vui lòng nhập email trước khi gửi mã.");
      return;
    }

    setIsSendingCode(true);
    setVerificationError(null);
    setVerificationMessage(null);

    try {
      const response = await fetch("/api/checkout/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          name: form.fullName,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Không thể gửi mã xác thực.");
      }

      setVerificationId(data.verificationId);
      setVerificationStatus("sent");
      setVerificationMessage("Đã gửi mã xác thực. Vui lòng kiểm tra email của bạn.");
      setVerificationExpiry(data.expiresAt ? new Date(data.expiresAt).getTime() : null);
    } catch (error) {
      setVerificationError(
        error instanceof Error ? error.message : "Không thể gửi mã xác thực. Vui lòng thử lại."
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationId) {
      setVerificationError("Bạn cần gửi mã xác thực trước.");
      return;
    }

    if (!verificationCode.trim()) {
      setVerificationError("Vui lòng nhập mã xác thực.");
      return;
    }

    setIsVerifyingCode(true);
    setVerificationError(null);
    setVerificationMessage(null);

    try {
      const response = await fetch("/api/checkout/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationId,
          code: verificationCode.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Mã xác thực không hợp lệ.");
      }

      setVerificationStatus("verified");
      setVerificationMessage("Mã xác thực hợp lệ. Bạn có thể tiến hành đặt hàng.");
    } catch (error) {
      setVerificationError(
        error instanceof Error ? error.message : "Không thể kiểm tra mã xác thực."
      );
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!cart || cart.items.length === 0) {
      setSubmitError("Giỏ hàng của bạn đang trống.");
      return;
    }

    if (selectedItems.length === 0) {
      setSubmitError("Bạn chưa chọn sản phẩm nào để đặt hàng.");
      return;
    }

    if (!verificationId || verificationStatus !== "verified") {
      setSubmitError("Bạn cần xác thực email trước khi đặt hàng.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verificationId,
          cartIdentifier: cart.identifier,
          paymentMethod,
          customer: {
            fullName: form.fullName,
            phone: form.phone,
            email: form.email,
            addressLine: form.addressLine,
            country: form.country,
            city: form.city,
            postalCode: form.postalCode,
          },
          notes: form.notes,
          selectedProductIds: selectedItems.map((item) => item.productId),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Không thể tạo đơn hàng.");
      }

      setOrderResult(data.order as SanitizedOrder);
      setVerificationMessage(null);
      setVerificationError(null);
      setVerificationStatus("idle");
      setVerificationId(null);
      setVerificationCode("");
      setVerificationExpiry(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(SELECTED_STORAGE_KEY);
      }
      await refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể tạo đơn hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const now = Date.now();
  const remainingMs = verificationExpiry ? verificationExpiry - now : null;
  const remainingMinutes =
    remainingMs && remainingMs > 0 ? Math.floor(remainingMs / 60000) : null;

  if (orderResult) {
    return (
      <section className={styles.checkoutPage}>
        <div className="container-width">
          <div className={styles.successState}>
            <h2>Cảm ơn bạn!</h2>
            <p>
              Đơn hàng của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ để xác nhận trong thời gian
              sớm nhất.
            </p>
            <div className={styles.successDetails}>
              <span>
                Mã đơn hàng: <strong>{orderResult.code}</strong>
              </span>
              <span>
                Tổng giá trị: <strong>{formatCurrency(orderResult.total)}</strong>
              </span>
              <span>
                Gửi đến: <strong>{orderResult.customer.fullName}</strong>
              </span>
            </div>
            <Link href="/tra-cuu-don-hang" className={styles.smallButton} style={{ marginTop: 24 }}>
              Tra cứu đơn hàng
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading && !cart) {
    return (
      <section className={styles.checkoutPage}>
        <div className="container-width">
          <div className={styles.emptyState}>
            <h2>Đang tải thông tin thanh toán...</h2>
          </div>
        </div>
      </section>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className={styles.checkoutPage}>
        <div className="container-width">
          <div className={styles.emptyState}>
            <h2>Giỏ hàng của bạn đang trống</h2>
            <p>Bạn chưa có sản phẩm nào để thanh toán.</p>
            <Link href="/san-pham" className={styles.smallButton}>
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.checkoutPage}>
      <div className="container-width">
        <h1>Thanh toán</h1>
        <div className={styles.layout}>
          <form className={styles.panel} onSubmit={handleSubmit}>
            <h2 className={styles.sectionTitle}>Thông tin nhận hàng</h2>

            <div className={styles.formGrid}>
              <div className={styles.formControl}>
                <label htmlFor="fullName">Họ và tên</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={handleFieldChange("fullName")}
                  required
                />
              </div>
              <div className={styles.formControl}>
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="09xx xxx xxx"
                  value={form.phone}
                  onChange={handleFieldChange("phone")}
                  required
                />
              </div>
              <div className={styles.formControl}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@domain.com"
                  value={form.email}
                  onChange={handleFieldChange("email")}
                  required
                />
              </div>
              <div className={styles.formControl}>
                <label htmlFor="country">Quốc gia</label>
                <select
                  id="country"
                  value={form.country}
                  onChange={handleFieldChange("country")}
                  required
                >
                  <option value="Việt Nam">Việt Nam</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="VN">VN</option>
                  <option value="Khác">Quốc gia khác</option>
                </select>
              </div>
              <div className={styles.formControl}>
                <label htmlFor="city">Tỉnh/Thành phố</label>
                <input
                  id="city"
                  type="text"
                  placeholder="Hà Nội"
                  value={form.city}
                  onChange={handleFieldChange("city")}
                />
              </div>
              <div className={styles.formControl}>
                <label htmlFor="postalCode">Mã bưu chính</label>
                <input
                  id="postalCode"
                  type="text"
                  placeholder="100000"
                  value={form.postalCode}
                  onChange={handleFieldChange("postalCode")}
                />
              </div>
              <div className={styles.formControl} style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="addressLine">Địa chỉ chi tiết</label>
                <textarea
                  id="addressLine"
                  placeholder="Số nhà, thôn/xóm, phường/xã..."
                  value={form.addressLine}
                  onChange={handleFieldChange("addressLine")}
                  required
                />
              </div>
            </div>

            <h2 className={styles.sectionTitle} style={{ marginTop: 36 }}>
              Xác thực email
            </h2>
            <div className={styles.formControl}>
              <label>Mã xác thực</label>
              <div className={styles.verificationRow}>
                <input
                  className={styles.codeInput}
                  type="text"
                  placeholder="Nhập mã 6 chữ số"
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  disabled={verificationStatus === "verified"}
                />
                <button
                  type="button"
                  className={styles.smallButton}
                  onClick={handleSendCode}
                  disabled={isSendingCode}
                >
                  {isSendingCode ? "Đang gửi..." : "Gửi mã"}
                </button>
                <button
                  type="button"
                  className={styles.smallButton}
                  onClick={handleVerifyCode}
                  disabled={isVerifyingCode || verificationStatus === "verified"}
                >
                  {isVerifyingCode ? "Đang kiểm tra..." : "Xác thực"}
                </button>
              </div>
              {verificationMessage && (
                <p className={styles.statusMessage}>{verificationMessage}</p>
              )}
              {verificationError && (
                <p className={`${styles.statusMessage} ${styles.error}`}>{verificationError}</p>
              )}
              {remainingMinutes && remainingMinutes > 0 && verificationStatus === "sent" && (
                <p className={styles.statusMessage}>
                  Mã sẽ hết hạn sau khoảng {remainingMinutes} phút.
                </p>
              )}
            </div>

            <h2 className={styles.sectionTitle} style={{ marginTop: 36 }}>
              Phương thức thanh toán
            </h2>
            <div className={styles.paymentOption}>
              <input
                type="radio"
                id="cod"
                name="paymentMethod"
                checked={paymentMethod === "cod"}
                readOnly
              />
              <label htmlFor="cod">
                <span>Thanh toán khi nhận hàng (COD)</span>
                <p>Thanh toán trực tiếp cho nhân viên giao hàng khi nhận sản phẩm.</p>
              </label>
            </div>

            <div className={styles.formControl} style={{ marginTop: 24 }}>
              <label htmlFor="notes">Ghi chú thêm</label>
              <textarea
                id="notes"
                placeholder="Ví dụ: Giao hàng ngoài giờ hành chính, lưu ý khi liên hệ..."
                value={form.notes}
                onChange={handleFieldChange("notes")}
              />
            </div>

            {submitError && (
              <p className={`${styles.statusMessage} ${styles.error}`}>{submitError}</p>
            )}

            <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </form>

          <aside className={styles.panel}>
            <h2 className={styles.sectionTitle}>Đơn hàng của bạn</h2>
            <div className={styles.summaryItems}>
              {selectedItems.length > 0 ? (
                <ul className={styles.itemsList}>
                  {selectedItems.map((item) => (
                    <li key={item.productId}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>{formatCurrency(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.statusMessage}>
                  Bạn chưa chọn sản phẩm nào. Vui lòng quay lại giỏ hàng để lựa chọn.
                </p>
              )}
              {selectedItems.length > 0 && (
                <p style={{ fontSize: 13, color: "#666" }}>
                  Đơn hàng gồm {selectedQuantity} sản phẩm theo lựa chọn của bạn.
                </p>
              )}
              <div className={styles.summaryRow}>
                <span>Tạm tính</span>
                <span>{formatCurrency(selectedSubtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Vận chuyển ({form.country})</span>
                <span>{formatCurrency(shippingFee)}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Tổng cộng</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <p style={{ fontSize: 13, color: "#666" }}>
                * Phí vận chuyển: Việt Nam {formatCurrency(30000)}, quốc tế {formatCurrency(50000)}.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
