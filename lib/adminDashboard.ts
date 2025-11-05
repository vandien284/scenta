import { getAllProducts } from "@/lib/productSource";
import { listOrders } from "@/lib/orderSource";
import { categoriesData } from "@/data/CategoriesData";
import { OrderSchema } from "@/types/OrderType";

export interface AdminSummaryStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUnitsSold: number;
  averageOrderValue: number;
  bestSellingProduct?: {
    productId: number;
    name: string;
    quantity: number;
  };
}

export interface ChartDatum {
  label: string;
  value: number;
}

export interface LatestOrderSummary {
  id: string;
  code: string;
  createdAt: string;
  total: number;
  status: OrderSchema["status"];
  itemCount: number;
}

export interface TopProductSummary {
  productId: number;
  name: string;
  quantity: number;
}

export interface AdminDashboardData {
  summary: AdminSummaryStats;
  revenueTrend: ChartDatum[];
  categoryDistribution: ChartDatum[];
  topProducts: TopProductSummary[];
  latestOrders: LatestOrderSummary[];
  orderStatusBreakdown: ChartDatum[];
}

export async function loadOrders(): Promise<OrderSchema[]> {
  try {
    return await listOrders();
  } catch (error) {
    console.error("[adminDashboard] Unable to load orders from blob:", error);
    return [];
  }
}

function buildRevenueTrend(orders: OrderSchema[]): ChartDatum[] {
  const totalsByMonth = new Map<string, number>();

  for (const order of orders) {
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const total = Number(order.total ?? 0);
    totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + total);
  }

  const months: ChartDatum[] = [];
  const now = new Date();
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleDateString("vi-VN", { month: "short", year: "numeric" });
    months.push({
      label,
      value: totalsByMonth.get(key) ?? 0,
    });
  }

  return months;
}

function buildCategoryDistribution(products: Awaited<ReturnType<typeof getAllProducts>>): ChartDatum[] {
  const categoryName = new Map<number, string>();
  categoriesData.forEach((category) => {
    categoryName.set(category.id, category.name);
  });

  const buckets = new Map<number, number>();
  products.forEach((product) => {
    const current = buckets.get(product.categoriesId) ?? 0;
    buckets.set(product.categoriesId, current + 1);
  });

  return Array.from(buckets.entries())
    .map(([id, count]) => ({
      label: categoryName.get(id) ?? `Danh mục ${id}`,
      value: count,
    }))
    .sort((a, b) => b.value - a.value);
}

function buildTopProducts(orders: OrderSchema[]): TopProductSummary[] {
  const buckets = new Map<number, TopProductSummary>();
  for (const order of orders) {
    for (const item of order.items) {
      const entry = buckets.get(item.productId);
      if (entry) {
        entry.quantity += item.quantity;
      } else {
        buckets.set(item.productId, {
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
        });
      }
    }
  }

  return Array.from(buckets.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
}

function buildLatestOrders(orders: OrderSchema[]): LatestOrderSummary[] {
  return [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((order) => ({
      id: order.id,
      code: order.code,
      createdAt: order.createdAt,
      total: order.total,
      status: order.status,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    }));
}

function buildStatusBreakdown(orders: OrderSchema[]): ChartDatum[] {
  const buckets = new Map<OrderSchema["status"], number>();
  for (const order of orders) {
    const status = order.status ?? "pending";
    buckets.set(status, (buckets.get(status) ?? 0) + 1);
  }

  const orderStatusLabels: Record<OrderSchema["status"], string> = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    cancelled: "Đã hủy",
  };

  return Array.from(buckets.entries())
    .map(([status, count]) => ({
      label: orderStatusLabels[status] ?? status,
      value: count,
    }))
    .sort((a, b) => b.value - a.value);
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  const [products, orders] = await Promise.all([getAllProducts(), loadOrders()]);

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const totalUnitsSold = orders.reduce(
    (sum, order) => sum + order.items.reduce((subSum, item) => subSum + item.quantity, 0),
    0
  );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const topProducts = buildTopProducts(orders);

  return {
    summary: {
      totalProducts,
      totalOrders,
      totalRevenue,
      totalUnitsSold,
      averageOrderValue,
      bestSellingProduct: topProducts[0],
    },
    revenueTrend: buildRevenueTrend(orders),
    categoryDistribution: buildCategoryDistribution(products),
    topProducts,
    latestOrders: buildLatestOrders(orders),
    orderStatusBreakdown: buildStatusBreakdown(orders),
  };
}
