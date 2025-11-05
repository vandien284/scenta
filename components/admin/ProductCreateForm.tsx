"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { createProductAction } from "@/app/actions/adminProductsActions";
import styles from "@/styles/components/admin/list.module.scss";

interface CategoryOption {
  id: number;
  name: string;
}

interface ProductCreateFormProps {
  categories: CategoryOption[];
}

export default function ProductCreateForm({ categories }: ProductCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setError(null);
    setSuccess(null);

    if (!categories.length) {
      setError("Chưa có danh mục nào để gán cho sản phẩm.");
      return;
    }

    startTransition(async () => {
      try {
        await createProductAction(formData);
        form.reset();
        setSuccess("Đã thêm sản phẩm mới.");
        router.refresh();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Không thể tạo sản phẩm.");
      }
    });
  };

  return (
    <section className={styles.formCard}>
      <h2 className={styles.formTitle}>Thêm sản phẩm mới</h2>
      <p className={styles.formSubtitle}>Điền đầy đủ thông tin cơ bản cho sản phẩm (không hỗ trợ tải hình ảnh).</p>
      <form onSubmit={handleSubmit} className={styles.productForm}>
        <div className={styles.formRow}>
          <label>Tên sản phẩm*</label>
          <input name="name" type="text" required placeholder="Ví dụ: Autumn Ember" />
        </div>

        <div className={styles.formRow}>
          <label>Slug URL*</label>
          <input name="url" type="text" required placeholder="autumn-ember" />
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <label>Danh mục*</label>
            <select
              name="categoriesId"
              required
              defaultValue={categories[0] ? String(categories[0].id) : ""}
              disabled={!categories.length}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formRow}>
            <label>Giá (VND)*</label>
            <input name="price" type="number" step="0.01" required placeholder="299000" />
          </div>
          <div className={styles.formRow}>
            <label>Tồn kho*</label>
            <input name="quantity" type="number" min={0} required placeholder="120" />
          </div>
          <div className={styles.formRow}>
            <label>Giảm giá (%)</label>
            <input name="sale" type="number" min={0} max={100} placeholder="0" />
          </div>
        </div>

        <div className={styles.formRow}>
          <label>Mô tả</label>
          <textarea name="description" rows={3} placeholder="Mô tả ngắn cho sản phẩm" />
        </div>

        <div className={styles.checkboxRow}>
          <label><input type="checkbox" name="bestSeller" /> Bán chạy</label>
          <label><input type="checkbox" name="outstanding" /> Nổi bật</label>
          <label><input type="checkbox" name="limited" /> Phiên bản giới hạn</label>
        </div>

        {error ? <div className={styles.formError}>{error}</div> : null}
        {success ? <div className={styles.formSuccess}>{success}</div> : null}

        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryButton} disabled={isPending}>
            {isPending ? "Đang lưu..." : "Tạo sản phẩm"}
          </button>
          <button
            type="button"
            className={styles.backLink}
            onClick={() => router.push("/admin/products")}
          >
            Trở về danh sách
          </button>
        </div>
      </form>
    </section>
  );
}
