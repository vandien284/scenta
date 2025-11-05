import styles from "@/styles/components/admin/list.module.scss";
import { loadProducts } from "@/lib/productInventory";
import Link from "next/link";
import ProductDeleteButton from "@/components/admin/ProductDeleteButton";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export const revalidate = 120;

export default async function AdminProductsPage() {
  const products = await loadProducts();

  return (
    <section className={styles.listPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Danh sách sản phẩm</h1>
          <p className={styles.subtitle}>Xem nhanh thông tin và thao tác với sản phẩm hiện có.</p>
        </div>
      </div>

      {products.length ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Sale</th>
                <th>Còn lại</th>
                <th>Đã bán</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, "vi"))
                .map((product) => {
                  const salePercent = Math.max(0, Math.min(100, product.sale ?? 0));
                  const discounted = salePercent
                    ? Math.round(product.price * (1 - salePercent / 100))
                    : Math.round(product.price);
                  const remaining = Math.max(product.quantity - product.sold, 0);

                  return (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>
                        <div className={styles.productCell}>
                          <span className={styles.productName}>{product.name}</span>
                          <span className={styles.productUrl}>/{product.url}</span>
                        </div>
                      </td>
                      <td>{product.categoriesId}</td>
                      <td>
                        <div className={styles.priceGroup}>
                          <span className={styles.salePrice}>{formatCurrency(discounted)}</span>
                          {salePercent > 0 ? (
                            <span className={styles.originalPrice}>{formatCurrency(product.price)}</span>
                          ) : null}
                        </div>
                      </td>
                      <td>{salePercent > 0 ? `-${salePercent}%` : "Không"}</td>
                      <td>{remaining}</td>
                      <td>{product.sold}</td>
                      <td className={styles.actionsCell}>
                        <Link href={`/admin/products/${product.id}`} className={styles.actionLink}>
                          Chỉnh sửa
                        </Link>
                        <ProductDeleteButton
                          productId={product.id}
                          productName={product.name}
                          className={styles.actionDelete}
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>Chưa có sản phẩm nào.</div>
      )}
    </section>
  );
}
