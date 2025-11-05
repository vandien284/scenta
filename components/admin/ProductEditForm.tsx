"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import Image from "next/image";
import { ProductType } from "@/types/ProductType";
import { updateProductAction, deleteProductAction } from "@/app/actions/adminProductsActions";
import styles from "@/styles/components/admin/list.module.scss";

interface ProductEditFormProps {
  product: ProductType;
  categories: Array<{ id: number; name: string }>;
}

export default function ProductEditForm({ product, categories }: ProductEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const imageList = product.images ?? [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("productId", String(product.id));

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await updateProductAction(formData);
        setSuccess("Đã lưu thay đổi.");
        router.refresh();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Không thể cập nhật sản phẩm.");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Bạn chắc chắn muốn xóa "${product.name}"?`)) return;
    const formData = new FormData();
    formData.set("productId", String(product.id));

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await deleteProductAction(formData);
        router.push("/admin/products");
        router.refresh();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Không thể xóa sản phẩm.");
      }
    });
  };

  return (
    <section className={styles.formCard}>
      <h2 className={styles.formTitle}>Chỉnh sửa sản phẩm</h2>
      <p className={styles.formSubtitle}>Cập nhật thông tin chi tiết cho sản phẩm (không chỉnh sửa hình ảnh).</p>
      <form onSubmit={handleSubmit} className={styles.productForm}>
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <label>Tên sản phẩm*</label>
            <input name="name" type="text" defaultValue={product.name} required />
          </div>
          <div className={styles.formRow}>
            <label>Slug URL*</label>
            <input name="url" type="text" defaultValue={product.url} required />
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <label>Danh mục*</label>
            <select
              name="categoriesId"
              required
              defaultValue={String(product.categoriesId)}
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
            <input name="price" type="number" step="0.01" defaultValue={product.price} required />
          </div>
          <div className={styles.formRow}>
            <label>Tồn kho*</label>
            <input name="quantity" type="number" min={0} defaultValue={product.quantity} required />
          </div>
          <div className={styles.formRow}>
            <label>Giảm giá (%)</label>
            <input name="sale" type="number" min={0} max={100} defaultValue={product.sale ?? ""} />
          </div>
        </div>

        <div className={styles.formRow}>
          <label>Mô tả</label>
          <textarea name="description" rows={3} defaultValue={product.description ?? ""} />
        </div>

        {imageList.length ? (
          <div className={styles.imageGallery}>
            {imageList.map((src) => (
              <div key={src} className={styles.imageItem}>
                <Image src={src} alt="Ảnh sản phẩm" width={140} height={140} className={styles.imagePreview} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.imageEmpty}>Sản phẩm chưa có hình ảnh.</div>
        )}

        <div className={styles.checkboxRow}>
          <label>
            <input type="checkbox" name="bestSeller" defaultChecked={Boolean(product.bestSeller)} /> Bán chạy
          </label>
          <label>
            <input type="checkbox" name="outstanding" defaultChecked={Boolean(product.outstanding)} /> Nổi bật
          </label>
          <label>
            <input type="checkbox" name="limited" defaultChecked={Boolean(product.limited)} /> Giới hạn
          </label>
        </div>

        {error ? <div className={styles.formError}>{error}</div> : null}
        {success ? <div className={styles.formSuccess}>{success}</div> : null}

        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryButton} disabled={isPending}>
            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={handleDelete}
            disabled={isPending}
          >
            Xóa sản phẩm
          </button>
          <button
            type="button"
            className={styles.backLink}
            onClick={() => router.push("/admin/products")}
            disabled={isPending}
          >
            Trở về danh sách
          </button>
        </div>
      </form>
    </section>
  );
}
