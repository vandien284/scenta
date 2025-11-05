"use server";

import { findOrderById, replaceOrder } from "@/lib/orderSource";
import { OrderSchema } from "@/types/OrderType";
import { revalidatePath } from "next/cache";

const ALLOWED_STATUSES: OrderSchema["status"][] = ["pending", "confirmed", "cancelled"];

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderSchema["status"];

  if (!orderId) {
    throw new Error("Thiếu mã đơn hàng.");
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("Trạng thái không hợp lệ.");
  }

  const order = await findOrderById(orderId);
  if (!order) {
    throw new Error("Không tìm thấy đơn hàng.");
  }

  if (order.status === status) {
    revalidatePath("/admin");
    return;
  }

  const updated: OrderSchema = {
    ...order,
    status,
  };

  await replaceOrder(updated);

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}
