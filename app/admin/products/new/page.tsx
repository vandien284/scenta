import ProductCreateForm from "@/components/admin/ProductCreateForm";
import styles from "@/styles/components/admin/list.module.scss";
import { categoriesData } from "@/data/CategoriesData";

export const metadata = {
  title: "Thêm sản phẩm | Admin Scenta",
};

export default function AdminProductCreatePage() {
  const categories = categoriesData.map((category) => ({ id: category.id, name: category.name }));
  return (
    <section className={styles.listPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Thêm sản phẩm mới</h1>
          <p className={styles.subtitle}>Nhập thông tin và tải hình ảnh để tạo sản phẩm.</p>
        </div>
      </div>
      <ProductCreateForm categories={categories} />
    </section>
  );
}
