"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState, useTransition } from "react";
import Image from "next/image";
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
  const [selectedImages, setSelectedImages] = useState<Array<{ file: File; preview: string }>>([]);

  useEffect(() => {
    return () => {
      selectedImages.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [selectedImages]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const mapped = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setSelectedImages((prev) => [...prev, ...mapped]);
    event.target.value = "";
  };

  const handleRemoveNewImage = (preview: string) => {
    setSelectedImages((prev) => {
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

    setError(null);
    setSuccess(null);

    if (!categories.length) {
      setError("Chưa có danh mục nào để gán cho sản phẩm.");
      return;
    }

    startTransition(async () => {
      try {
        formData.delete("newImages");
        selectedImages.forEach(({ file }) => formData.append("newImages", file));
        await createProductAction(formData);
        form.reset();
        setSelectedImages([]);
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
      <p className={styles.formSubtitle}>Điền thông tin cơ bản và tải lên hình ảnh nén tự động.</p>
      <form onSubmit={handleSubmit} className={styles.productForm} encType="multipart/form-data">
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

        <div className={styles.formRow}>
          <label>Thêm hình ảnh mới</label>
          <input name="newImages" type="file" accept="image/*" multiple onChange={handleFileChange} />
          <span className={styles.formHint}>Ảnh sẽ được nén và lưu tại /public/images/product</span>
        </div>

        {selectedImages.length ? (
          <div className={styles.imageGallery}>
            {selectedImages.map((item) => (
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
                  Xóa
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.imageEmpty}>Chưa chọn hình ảnh mới.</div>
        )}

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
