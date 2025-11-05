import ProductEditForm from "@/components/admin/ProductEditForm";
import styles from "@/styles/components/admin/list.module.scss";
import { loadProducts } from "@/lib/productInventory";
import { notFound } from "next/navigation";
import { categoriesData } from "@/data/CategoriesData";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 120;

export const metadata = {
  title: "Chỉnh sửa sản phẩm | Admin Scenta",
};

export default async function AdminProductEditPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    notFound();
  }

  const products = await loadProducts();
  const product = products.find((item) => item.id === numericId);
  if (!product) {
    notFound();
  }

  const categories = categoriesData.map((category) => ({ id: category.id, name: category.name }));

  return (
    <section className={styles.listPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Chỉnh sửa sản phẩm</h1>
          <p className={styles.subtitle}>#{product.id} · {product.name}</p>
        </div>
      </div>
      <ProductEditForm product={product} categories={categories} />
    </section>
  );
}
