"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/components/gift/giftGuideForm.module.scss";
import Image from "next/image";
import Link from "next/link";

interface Suggestion {
  productName: string;
  reason: string;
  cardMessage: string;
  product?: {
    id: number;
    name: string;
    url: string;
    price: number;
    image?: string | null;
    description?: string;
  };
}

interface GiftResponse {
  suggestions?: Suggestion[];
  raw?: string;
  note?: string;
  error?: string;
}

const INITIAL_FORM = {
  name: "",
  birthDate: "",
  gender: "",
  hobbies: "",
  scent: "",
  budget: "",
};

export default function GiftGuideForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<GiftResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }),
    []
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = Object.values(form).every((val) => val.trim() !== "");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Không thể tạo gợi ý quà tặng.");

      setResult(data as GiftResponse);
    } catch (err) {
      console.error("[GiftGuide] error:", err);
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setResult(null);
    setError(null);
  };

  return (
    <div className={styles.wrapper}>
      <div className="container-width">
        <div className={styles.hero}>
          <h1>Gợi ý quà tặng cá nhân hóa</h1>
          <p>
            Điền đầy đủ thông tin về người nhận, Scenta Assistant sẽ đề xuất sản phẩm phù hợp và lời nhắn dễ thương cho tấm thiệp của bạn.
          </p>
        </div>

        <div className={styles.content}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label htmlFor="name">Tên người nhận</label>
              <input
                id="name"
                name="name"
                placeholder="Ví dụ: Minh Anh"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.twoColumns}>
              <div className={styles.fieldGroup}>
                <label htmlFor="birthDate">Ngày sinh</label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="gender">Giới tính</label>
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn giới tính</option>
                  <option value="nu">Nữ</option>
                  <option value="nam">Nam</option>
                  <option value="khac">Khác</option>
                </select>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="hobbies">Sở thích / Dịp đặc biệt</label>
              <textarea
                id="hobbies"
                name="hobbies"
                placeholder="Ví dụ: Thích đọc sách, sinh nhật 30 tuổi, công việc văn phòng..."
                value={form.hobbies}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="scent">Mùi hương yêu thích</label>
              <textarea
                id="scent"
                name="scent"
                placeholder="Ví dụ: hương hoa lavender, gỗ ấm, hoặc sản phẩm đã từng thích..."
                value={form.scent}
                onChange={handleChange}
                rows={2}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="budget">Ngân sách dự kiến</label>
              <input
                id="budget"
                name="budget"
                placeholder="Ví dụ: 500.000 - 1.000.000"
                value={form.budget}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.actions}>
              <button type="button" onClick={handleReset} className={styles.secondary}>
                <span className={styles.default}>Làm mới</span>
                <span className={styles.hover}> Làm mới</span>

              </button>

              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`${styles.submitBtn} ${(!isFormValid || isSubmitting) ? styles.disabled : ""
                  }`}
              >

                <span className={styles.default}>{isSubmitting ? "Đang tạo gợi ý..." : "Gợi ý quà ngay"}</span>
                <span className={styles.hover}> {isSubmitting ? "Đang tạo gợi ý..." : "Gợi ý quà ngay"}</span>
              </button>
            </div>
          </form>

          <div className={styles.result}>
            <div className={styles.resultHeader}>
              <h2>Kết quả tư vấn</h2>
              <p>Gợi ý sẽ hiển thị tại đây kèm lời nhắn để bạn ghi trên tấm thiệp.</p>
            </div>

            <div className={styles.resultBody}>
              {error && <div className={styles.errorBox}>{error}</div>}
              {isSubmitting && <div className={styles.loading}>Đang trò chuyện với AI...</div>}
              {!isSubmitting && !error && result?.suggestions?.length ? (
                <ul className={styles.suggestionList}>
                  {result.suggestions.map((item, index) => (
                    <li key={`${item.productName}-${index}`} className={styles.suggestionItem}>
                      <h3>{item.productName}</h3>
                      {item.product && (
                        <div className={styles.productMeta}>
                          {item.product.image && (
                            <Image
                              width={100}
                              height={100}
                              src={item.product.image}
                              alt={item.product.name}
                              loading="lazy"
                            />
                          )}
                          <div className={styles.metaInfo}>
                            <span>Giá: {currencyFormatter.format(item.product.price)}</span>
                            {item.product.description && <span>{item.product.description}</span>}
                            <Link href={`/san-pham/${item.product.url}`} rel="noreferrer">
                              Xem chi tiết sản phẩm
                            </Link>
                          </div>
                        </div>
                      )}

                      <p className={styles.reason}>{item.reason}</p>
                      <div className={styles.cardMessage}>
                        <span>Lời nhắn trên thiệp</span>
                        <p>{item.cardMessage}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {!isSubmitting && !error && result && !result.suggestions?.length && (
                <div className={styles.noteBox}>
                  <p>
                    {result.note ||
                      "AI chưa trả về danh sách rõ ràng. Bạn có thể thử lại với thông tin cụ thể hơn."}
                  </p>
                </div>
              )}

              {!isSubmitting && !error && !result && (
                <div className={styles.placeholder}>
                  Điền đầy đủ thông tin ở form bên cạnh để nhận gợi ý quà tặng phù hợp ngay nhé!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
