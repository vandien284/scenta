import styles from "@/styles/components/admin/dashboard.module.scss";
import { fetchAdminDashboardData, ChartDatum, TopProductSummary } from "@/lib/adminDashboard";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";
import type { OrderSchema } from "@/types/OrderType";
import { formatCurrencyVND } from "@/utils/formatCurrency";

export const revalidate = 120;

const numberFormatter = new Intl.NumberFormat("vi-VN");

const STATUS_OPTIONS: { value: OrderSchema["status"]; label: string }[] = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "cancelled", label: "Đã hủy" },
];

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "0";
  return `${formatCurrencyVND(Math.round(value))} ₫`;
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0";
  return numberFormatter.format(Math.round(value));
}

function BarChart({ data }: { data: ChartDatum[] }) {
  if (!data.length) {
    return <div className={styles.emptyState}>Chưa có dữ liệu doanh thu để hiển thị.</div>;
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className={styles.barChart}>
      {data.map((item) => (
        <div key={item.label} className={styles.barColumn}>
          <div
            className={styles.bar}
            style={{ height: `${(item.value / maxValue) * 100}%` }}
            title={`${item.label}: ${formatCurrency(item.value)}`}
          />
          <div className={styles.barValue}>{formatCurrency(item.value)}</div>
          <div className={styles.barLabel}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function HorizontalChart({ data }: { data: ChartDatum[] }) {
  if (!data.length) {
    return <div className={styles.emptyState}>Chưa có dữ liệu để hiển thị.</div>;
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className={styles.horizontalChart}>
      {data.map((item) => (
        <div key={item.label} className={styles.horizontalItem}>
          <div className={styles.horizontalLabelRow}>
            <span>{item.label}</span>
            <span>{formatNumber(item.value)}</span>
          </div>
          <div className={styles.horizontalBar}>
            <span style={{ width: `${(item.value / maxValue) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TopProducts({ data }: { data: TopProductSummary[] }) {
  if (!data.length) {
    return <div className={styles.emptyState}>Chưa có sản phẩm bán chạy.</div>;
  }

  return (
    <div className={styles.list}>
      {data.map((product) => (
        <div key={product.productId} className={styles.listItem}>
          <div className={styles.listMeta}>
            <span className={styles.listTitle}>{product.name}</span>
            <span className={styles.listSub}>Đã bán: {formatNumber(product.quantity)} sản phẩm</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const data = await fetchAdminDashboardData();


  const {
    summary,
    revenueTrend,
    categoryDistribution,
    topProducts,
    latestOrders,
    orderStatusBreakdown,
  } = data;

  return (
    <section className={styles.dashboard}>
      <div>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Tổng quan cửa hàng</h1>
            <p className={styles.subtitle}>
              Theo dõi hiệu suất bán hàng, doanh thu và các chỉ số chính của Scenta.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.card} ${styles.summaryCard}`}>
            <span className={styles.summaryLabel}>Sản phẩm</span>
            <span className={styles.summaryValue}>{formatNumber(summary.totalProducts)}</span>
            <span className={styles.summaryDelta}>Số lượng sản phẩm hiện có trong kho.</span>
          </div>

          <div className={`${styles.card} ${styles.summaryCard}`}>
            <span className={styles.summaryLabel}>Đơn hàng</span>
            <span className={styles.summaryValue}>{formatNumber(summary.totalOrders)}</span>
            <span className={styles.summaryDelta}>Tổng số đơn hàng đã ghi nhận.</span>
          </div>

          <div className={`${styles.card} ${styles.summaryCard}`}>
            <span className={styles.summaryLabel}>Doanh thu</span>
            <span className={styles.summaryValue}>{formatCurrency(summary.totalRevenue)}</span>
            <span className={styles.summaryDelta}>
              Giá trị trung bình: {formatCurrency(summary.averageOrderValue)}
            </span>
          </div>

          <div className={`${styles.card} ${styles.summaryCard}`}>
            <span className={styles.summaryLabel}>Sản phẩm đã bán</span>
            <span className={styles.summaryValue}>{formatNumber(summary.totalUnitsSold)}</span>
            <span className={styles.summaryDelta}>
              {summary.bestSellingProduct
                ? `Bán chạy: ${summary.bestSellingProduct.name} (${formatNumber(summary.bestSellingProduct.quantity)})`
                : "Chưa có dữ liệu bán chạy."}
            </span>
          </div>

          <div className={`${styles.card} ${styles.chartCard}`}>
            <h2 className={styles.chartTitle}>Doanh thu 6 tháng gần nhất</h2>
            <BarChart data={revenueTrend} />
          </div>

          <div className={`${styles.card} ${styles.miniChartCard}`}>
            <h2 className={styles.chartTitle}>Phân bổ danh mục</h2>
            <HorizontalChart data={categoryDistribution} />
          </div>

          <div className={`${styles.card} ${styles.miniChartCard}`}>
            <h2 className={styles.chartTitle}>Trạng thái đơn hàng</h2>
            <HorizontalChart data={orderStatusBreakdown} />
          </div>

          <div className={`${styles.card} ${styles.miniChartCard}`}>
            <h2 className={styles.chartTitle}>Sản phẩm bán chạy</h2>
            <TopProducts data={topProducts} />
          </div>

          <div className={`${styles.card} ${styles.chartCard}`}>
            <h2 className={styles.chartTitle}>Đơn hàng gần đây</h2>
            {latestOrders.length ? (
              <div className={styles.list}>
                {latestOrders.map((order) => (
                  <div key={order.id} className={styles.listItem}>
                    <div className={styles.listMeta}>
                      <span className={styles.listTitle}>{order.code}</span>
                      <span className={styles.listSub}>
                        {new Date(order.createdAt).toLocaleString("vi-VN")} · {order.itemCount} sản phẩm
                      </span>
                    </div>
                    <div>
                      <span className={styles.listSub}>{formatCurrency(order.total)}</span>
                      <span
                        className={`${styles.statusBadge} ${
                          order.status === "confirmed"
                            ? styles.statusConfirmed
                            : order.status === "cancelled"
                            ? styles.statusCancelled
                            : styles.statusPending
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>Chưa có đơn hàng nào được tạo.</div>
            )}
          </div>

          <div className={`${styles.card} ${styles.statusCard}`}>
            <h2 className={styles.chartTitle}>Xử lý trạng thái đơn hàng</h2>
            {latestOrders.length ? (
              <div className={styles.statusManager}>
                {latestOrders.map((order) => (
                  <div key={order.id} className={styles.statusForm}>
                    <div className={styles.statusFormMeta}>
                      <span className={styles.listTitle}>{order.code}</span>
                      <span className={styles.listSub}>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")} · {formatCurrency(order.total)}
                      </span>
                    </div>
                    <div className={styles.statusFormActions}>
                      <OrderStatusUpdater
                        orderId={order.id}
                        defaultStatus={order.status}
                        options={STATUS_OPTIONS}
                        className={styles.inlineForm}
                        selectClassName={styles.statusSelect}
                        buttonClassName={styles.statusButton}
                        buttonLabel="Cập nhật"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>Chưa có đơn hàng để cập nhật.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
