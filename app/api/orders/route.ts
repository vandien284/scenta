import crypto from "crypto";
import { NextResponse } from "next/server";
import { getCartSnapshot, upsertCartSnapshot } from "@/lib/cartSource";
import { getAllProducts } from "@/lib/productSource";
import { applyInventoryAdjustments } from "@/lib/productInventory";
import {
  appendOrder,
  ensureUniqueCode,
  stripOrderSecrets,
} from "@/lib/orderSource";
import {
  consumeVerifiedRecord,
  ensureVerifiedRecord,
} from "@/lib/verificationStore";
import { calculateShippingFee } from "@/shared/shipping";
import { OrderCustomer, OrderItem, OrderSchema, PaymentMethod } from "@/types/OrderType";

export const runtime = "nodejs";

interface CheckoutPayload {
  verificationId: string;
  cartIdentifier: string;
  customer: Partial<OrderCustomer> & Record<string, unknown>;
  notes?: string;
  paymentMethod?: PaymentMethod;
  selectedProductIds?: Array<number | string>;
}

function validatePayload(payload: CheckoutPayload) {
  const errors: string[] = [];
  const customerInput = payload.customer ?? {};

  const customer: OrderCustomer = {
    fullName: typeof customerInput.fullName === "string" ? customerInput.fullName.trim() : "",
    phone: typeof customerInput.phone === "string" ? customerInput.phone.trim() : "",
    email: typeof customerInput.email === "string" ? customerInput.email.trim() : "",
    addressLine:
      typeof customerInput.addressLine === "string" ? customerInput.addressLine.trim() : "",
    country: typeof customerInput.country === "string" ? customerInput.country.trim() : "",
    city: typeof customerInput.city === "string" ? customerInput.city.trim() : undefined,
    postalCode:
      typeof customerInput.postalCode === "string" ? customerInput.postalCode.trim() : undefined,
  };

  if (!customer.fullName) errors.push("Vui lòng nhập họ tên.");
  if (!customer.phone) errors.push("Vui lòng nhập số điện thoại.");
  if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    errors.push("Email không hợp lệ.");
  }
  if (!customer.addressLine) errors.push("Vui lòng nhập địa chỉ chi tiết.");
  if (!customer.country) errors.push("Vui lòng nhập quốc gia/khu vực.");

  return { errors, customer };
}

function mapProduct(product: Awaited<ReturnType<typeof getAllProducts>>[number]) {
  const available = Math.max(product.quantity - product.sold, 0);
  return {
    id: product.id,
    name: product.name,
    url: product.url,
    price: product.price,
    image: product.images?.[0] ?? null,
    available,
    description: product.description,
  };
}

async function loadProductsMap() {
  const products = await getAllProducts();
  const map = new Map<number, ReturnType<typeof mapProduct>>();
  for (const product of products) {
    const value = mapProduct(product);
    map.set(product.id, value);
  }
  return map;
}

async function buildOrderItems(
  cartIdentifier: string,
  productsMap: Map<number, ReturnType<typeof mapProduct>>,
  selectedSet: Set<number>
) {
  const cart = await getCartSnapshot(cartIdentifier);
  if (!cart.items.length) {
    throw new Error("Giỏ hàng hiện đang trống.");
  }

  const items: OrderItem[] = [];
  let subtotal = 0;

  for (const item of cart.items) {
    if (!selectedSet.has(item.productId)) {
      continue;
    }

    const product = productsMap.get(item.productId);
    if (!product) {
      throw new Error("Một sản phẩm trong giỏ hàng không còn tồn tại.");
    }

    if (product.available <= 0) {
      throw new Error(`Sản phẩm "${product.name}" đã hết hàng.`);
    }

    if (item.quantity > product.available) {
      throw new Error(
        `Sản phẩm "${product.name}" chỉ còn ${product.available} sản phẩm. Vui lòng cập nhật giỏ hàng.`
      );
    }

    const quantity = Math.max(item.quantity, 0);
    if (quantity === 0) {
      continue;
    }

    const unitPrice = product.price;
    const lineSubtotal = unitPrice * quantity;

    items.push({
      productId: product.id,
      name: product.name,
      url: product.url,
      image: product.image,
      quantity,
      unitPrice,
      subtotal: lineSubtotal,
    });

    subtotal += lineSubtotal;
  }

  if (items.length === 0) {
    throw new Error("Không tìm thấy sản phẩm hợp lệ trong giỏ hàng.");
  }

  return { items, subtotal };
}

function generateBaseOrderCode() {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SC-${year}${month}${day}-${random}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as CheckoutPayload | null;
    if (!body) {
      return NextResponse.json({ error: "Thiếu thông tin yêu cầu." }, { status: 400 });
    }

    const verificationId = body.verificationId?.trim();
    const cartIdentifier = body.cartIdentifier?.trim();
    const notes =
      typeof body.notes === "string" && body.notes.trim().length > 0 ? body.notes.trim() : undefined;

    if (!verificationId) {
      return NextResponse.json({ error: "Thiếu mã xác thực." }, { status: 400 });
    }

    if (!cartIdentifier) {
      return NextResponse.json({ error: "Thiếu thông tin giỏ hàng." }, { status: 400 });
    }

    const paymentMethod = body.paymentMethod ?? "cod";
    if (paymentMethod !== "cod") {
      return NextResponse.json(
        { error: "Hiện chỉ hỗ trợ thanh toán khi nhận hàng (COD)." },
        { status: 400 }
      );
    }

    const { errors, customer } = validatePayload(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const rawSelected = Array.isArray(body.selectedProductIds)
      ? body.selectedProductIds
      : [];
    const selectedIds = rawSelected
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    const selectedSet = new Set(selectedIds);

    if (selectedSet.size === 0) {
      return NextResponse.json(
        { error: "Vui lòng chọn ít nhất một sản phẩm để đặt hàng." },
        { status: 400 }
      );
    }

    await ensureVerifiedRecord(verificationId);

    const productsMap = await loadProductsMap();
    const { items, subtotal } = await buildOrderItems(cartIdentifier, productsMap, selectedSet);

    const shippingFee = calculateShippingFee(customer.country);
    const total = subtotal + shippingFee;

    const baseCode = generateBaseOrderCode();
    const code = await ensureUniqueCode(baseCode);
    const order: OrderSchema = {
      id: crypto.randomUUID(),
      code,
      createdAt: new Date().toISOString(),
      cartIdentifier,
      paymentMethod,
      shippingFee,
      subtotal,
      total,
      notes,
      customer,
      items,
      status: "pending",
      verificationId,
    };

    await applyInventoryAdjustments(
      items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
    );

    await appendOrder(order);
    await consumeVerifiedRecord(verificationId);
    await upsertCartSnapshot(cartIdentifier, (cart) => ({
      ...cart,
      items: cart.items.filter((item) => !selectedSet.has(item.productId)),
    }));

    return NextResponse.json({
      order: stripOrderSecrets(order),
    });
  } catch (error) {
    console.error("[orders][POST]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể tạo đơn hàng. Vui lòng thử lại sau.",
      },
      { status: 500 }
    );
  }
}
