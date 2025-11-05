"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState, useTransition } from "react";
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
  const [keptImages, setKeptImages] = useState<string[]>(product.images ?? []);
  const [newImages, setNewImages] = useState<Array<{ file: File; preview: string }>>([]);

  useEffect(() => {
    return () => {
      newImages.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [newImages]);

  const handleRemoveExistingImage = (src: string) => {
    setKeptImages((prev) => prev.filter((value) => value !== src));
  };

  const handleNewImagesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const mapped = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setNewImages((prev) => [...prev, ...mapped]);
    event.target.value = "";
  };

  const handleRemoveNewImage = (preview: string) => {
    setNewImages((prev) => {
      const next = prev.filter((item) => item.preview !== preview);
      const removed = prev.find((item) => item.preview === preview);
      if (removed) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("productId", String(product.id));
    formData.delete("newImages");
    newImages.forEach(({ file }) => formData.append("newImages", file));
    keptImages.forEach((src) => formData.append("keepImage", src));

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
      <p className={styles.formSubtitle}>Cập nhật nội dung và hình ảnh cho sản phẩm hiện có.</p>
      <form onSubmit={handleSubmit} className={styles.productForm} encType="multipart/form-data">
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

        <div className={styles.formRow}>
          <label>Thêm hình ảnh mới</label>
          <input name="newImages" type="file" accept="image/*" multiple onChange={handleNewImagesChange} />
          <span className={styles.formHint}>Ảnh sẽ được nén và lưu tại /images/product</span>
        </div>

        <div className={styles.imageGallery}>
          {keptImages.map((src) => (
            <div key={src} className={styles.imageItem}>
              <Image
                src={src}
                alt="Ảnh sản phẩm"
                width={140}
                height={140}
                className={styles.imagePreview}
              />
              <button
                type="button"
                className={styles.imageRemove}
                onClick={() => handleRemoveExistingImage(src)}
              >
                Xóa
              </button>
            </div>
          ))}
          {newImages.map((item) => (
            <div key={item.preview} className={styles.imageItem}>
              <Image
                src={item.preview}
                alt="Ảnh mới"
                width={140}
                height={140}
                className={styles.imagePreview}
                unoptimized
              />
              <button
                type="button"
                className={styles.imageRemove}
                onClick={() => handleRemoveNewImage(item.preview)}
              >
                Huỷ
              </button>
            </div>
          ))}
          {keptImages.length === 0 && newImages.length === 0 ? (
            <div className={styles.imageEmpty}>Chưa có hình ảnh cho sản phẩm này.</div>
          ) : null}
        </div>

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
