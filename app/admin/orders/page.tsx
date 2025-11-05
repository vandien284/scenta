import styles from "@/styles/components/admin/list.module.scss";
import { loadOrders } from "@/lib/adminDashboard";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";
import type { OrderSchema } from "@/types/OrderType";

export const revalidate = 120;

const STATUS_OPTIONS: { value: OrderSchema["status"]; label: string }[] = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "cancelled", label: "Đã hủy" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export default async function AdminOrdersPage() {
  const orders = await loadOrders();

  return (
    <section className={styles.listPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Đơn hàng</h1>
          <p className={styles.subtitle}>Theo dõi và cập nhật trạng thái đơn hàng mới nhất.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>Chưa có đơn hàng nào.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày tạo</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Sản phẩm</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.code}</td>
                  <td>{new Date(order.createdAt).toLocaleString("vi-VN")}</td>
                  <td>
                    <div className={styles.productCell}>
                      <span className={styles.productName}>{order.customer.fullName}</span>
                      <span className={styles.productUrl}>{order.customer.phone}</span>
                    </div>
                  </td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>
                    <ul className={styles.orderItems}>
                      {order.items.map((item) => (
                        <li key={`${order.id}-${item.productId}`}>
                          {item.name} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <OrderStatusUpdater
                      orderId={order.id}
                      defaultStatus={order.status}
                      options={STATUS_OPTIONS}
                      className={styles.inlineForm}
                      selectClassName={styles.statusSelect}
                      buttonClassName={styles.statusButton}
                      buttonLabel="Lưu"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
