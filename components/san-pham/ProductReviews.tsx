"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "@/styles/components/san-pham/productReviews.module.scss";
import { ProductType } from "@/types/ProductType";
import { ReviewType } from "@/types/ReviewType";

interface ProductReviewsProps {
  product: ProductType;
}

interface FormState {
  reviewerName: string;
  rating: number;
  content: string;
}

const ratingOptions = [
  { value: 5, label: "5 - Rất hài lòng" },
  { value: 4, label: "4 - Hài lòng" },
  { value: 3, label: "3 - Bình thường" },
  { value: 2, label: "2 - Chưa tốt" },
  { value: 1, label: "1 - Không hài lòng" },
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>({
    reviewerName: "",
    rating: 5,
    content: "",
  });

  const averageRating = useMemo(() => {
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/reviews?productSlug=${encodeURIComponent(product.url)}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to load reviews: ${response.statusText}`);
        }
        const data = (await response.json()) as { reviews?: ReviewType[] };
        if (isMounted) {
          setReviews(data.reviews ?? []);
        }
      } catch (error) {
        console.error("[ProductReviews] Unable to load reviews:", error);
        if (isMounted) {
          setReviews([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [product.url]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedName = formState.reviewerName.trim();
    const trimmedContent = formState.content.trim();

    if (!trimmedName || !trimmedContent) {
      setSubmitError("Vui lòng nhập đầy đủ họ tên và nội dung đánh giá.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          productSlug: product.url,
          productName: product.name,
          reviewerName: trimmedName,
          rating: formState.rating,
          content: trimmedContent,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = data?.error ?? "Không thể gửi đánh giá. Vui lòng thử lại sau.";
        throw new Error(message);
      }

      const data = (await response.json()) as { review: ReviewType };
      setReviews((prev) => [data.review, ...prev]);
      setFormState({
        reviewerName: "",
        rating: 5,
        content: "",
      });
      setSubmitSuccess("Cảm ơn bạn! Đánh giá của bạn đã được ghi nhận.");
    } catch (error) {
      console.error("[ProductReviews] Submit failed:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Không thể gửi đánh giá. Vui lòng thử lại sau."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Đánh giá sản phẩm</h2>
        <p className={styles.subtitle}>
          Chia sẻ trải nghiệm của bạn với <strong>{product.name}</strong>.
        </p>
        {reviews.length > 0 && (
          <div className={styles.summary}>
            <span className={styles.average}>{averageRating}</span>
            <span className={styles.summaryLabel}>
              /5 từ {reviews.length} đánh giá
            </span>
          </div>
        )}
      </div>

      <div className={styles.layout}>
        <div className={styles.reviewList}>
          {isLoading ? (
            <div className={styles.placeholder}>Đang tải đánh giá...</div>
          ) : reviews.length === 0 ? (
            <div className={styles.placeholder}>
              Chưa có đánh giá nào cho sản phẩm này. Hãy chia sẻ cảm nhận của bạn!
            </div>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <div>
                    <div className={styles.reviewer}>{review.reviewerName}</div>
                    <div className={styles.productName}>{review.productName}</div>
                  </div>
                  <div className={styles.ratingBadge}>{review.rating}/5</div>
                </div>
                <p className={styles.reviewContent}>{review.content}</p>
                <div className={styles.reviewFooter}>
                  <span className={styles.reviewDate}>
                    {formatDate(review.createdAt) || "Mới cập nhật"}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <h3 className={styles.formTitle}>Viết đánh giá của bạn</h3>

          {submitError ? <div className={styles.error}>{submitError}</div> : null}
          {submitSuccess ? <div className={styles.success}>{submitSuccess}</div> : null}

          <div className={styles.formGroup}>
            <label htmlFor="reviewerName">Họ tên *</label>
            <input
              id="reviewerName"
              name="reviewerName"
              type="text"
              placeholder="Nhập tên của bạn"
              value={formState.reviewerName}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, reviewerName: event.target.value }))
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="rating">Mức độ hài lòng *</label>
            <select
              id="rating"
              name="rating"
              value={formState.rating}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  rating: Number.parseInt(event.target.value, 10),
                }))
              }
            >
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content">Nội dung đánh giá *</label>
            <textarea
              id="content"
              name="content"
              rows={5}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
              value={formState.content}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, content: event.target.value }))
              }
              required
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </form>
      </div>
    </section>
  );
}
