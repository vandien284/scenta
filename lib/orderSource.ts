import { head, put } from "@vercel/blob";
import { OrderSchema, OrderStoreSchema } from "@/types/OrderType";

const ORDER_BLOB_SOURCE = process.env.ORDERS_BLOB_URL ?? process.env.ORDERS_BLOB_PATH;
const ORDER_BLOB_PATH = process.env.ORDERS_BLOB_PATH;
const BLOB_TOKEN =
  process.env.VERCEL_BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_RW_TOKEN;

let cachedStore: OrderStoreSchema | null = null;
let lastFetchTime = 0;

const CACHE_TTL = 15_000;

async function fetchFromBlob(): Promise<OrderStoreSchema | null> {
  if (!ORDER_BLOB_SOURCE) {
    return null;
  }

  try {
    if (ORDER_BLOB_SOURCE.startsWith("http")) {
      const response = await fetch(ORDER_BLOB_SOURCE, {
        headers: BLOB_TOKEN
          ? {
            Authorization: `Bearer ${BLOB_TOKEN}`,
          }
          : undefined,
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch order store: ${response.statusText}`);
      }

      return (await response.json()) as OrderStoreSchema;
    }

    const blob = await head(ORDER_BLOB_SOURCE, {
      token: BLOB_TOKEN,
    });
    const response = await fetch(blob.downloadUrl, { next: { revalidate: 0 } });
    if (!response.ok) {
      throw new Error(`Failed to download orders blob: ${response.statusText}`);
    }
    return (await response.json()) as OrderStoreSchema;
  } catch (error) {
    console.warn("[orderSource] Unable to load order store from blob:", error);
    return null;
  }
}

async function loadStore(): Promise<OrderStoreSchema> {
  const now = Date.now();
  if (cachedStore && now - lastFetchTime < CACHE_TTL) {
    return cachedStore;
  }

  if (!ORDER_BLOB_SOURCE) {
    throw new Error("ORDERS_BLOB_URL hoặc ORDERS_BLOB_PATH chưa được cấu hình.");
  }

  const store = (await fetchFromBlob()) ?? { orders: [] };

  cachedStore = {
    orders: Array.isArray(store.orders) ? [...store.orders] : [],
  };
  lastFetchTime = now;

  return cachedStore;
}

async function persistStore(store: OrderStoreSchema) {
  if (!ORDER_BLOB_PATH) {
    throw new Error("ORDERS_BLOB_PATH chưa được cấu hình để ghi dữ liệu.");
  }
  await put(
    ORDER_BLOB_PATH,
    JSON.stringify(store, null, 2),
    {
      access: "public",
      token: BLOB_TOKEN,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    }
  );
  cachedStore = { orders: [...store.orders] };
  lastFetchTime = Date.now();
  return cachedStore;
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export async function listOrders(): Promise<OrderSchema[]> {
  const store = await loadStore();
  return [...store.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function appendOrder(order: OrderSchema): Promise<OrderSchema> {
  const store = await loadStore();
  const orders = [
    order,
    ...store.orders.filter((existing) => existing.id !== order.id && existing.code !== order.code),
  ];

  const nextStore: OrderStoreSchema = {
    orders,
  };

  await persistStore(nextStore);
  return order;
}

export async function replaceOrder(updated: OrderSchema): Promise<OrderSchema> {
  const store = await loadStore();
  const orders = store.orders.map((order) => (order.id === updated.id ? updated : order));
  const nextStore: OrderStoreSchema = { orders };
  await persistStore(nextStore);
  return updated;
}

export async function findOrderById(id: string): Promise<OrderSchema | null> {
  const store = await loadStore();
  return store.orders.find((order) => order.id === id) ?? null;
}

export async function findOrderByCode(code: string): Promise<OrderSchema | null> {
  if (!code) return null;
  const normalized = normalizeCode(code);
  const store = await loadStore();
  return store.orders.find((order) => normalizeCode(order.code) === normalized) ?? null;
}

export async function ensureUniqueCode(base: string): Promise<string> {
  const store = await loadStore();
  const normalizedBase = normalizeCode(base);
  const existing = new Set(store.orders.map((order) => normalizeCode(order.code)));

  if (!existing.has(normalizedBase)) {
    return normalizedBase;
  }

  let attempt = 1;
  let nextCode = `${normalizedBase}-${attempt.toString().padStart(2, "0")}`;
  while (existing.has(nextCode)) {
    attempt += 1;
    nextCode = `${normalizedBase}-${attempt.toString().padStart(2, "0")}`;
    if (attempt > 99) {
      nextCode = `${normalizedBase}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      if (!existing.has(nextCode)) {
        break;
      }
    }
  }

  return nextCode;
}

export function stripOrderSecrets(order: OrderSchema) {
  const {
    cartIdentifier: _cartIdentifier,
    verificationId: _verificationId,
    ...rest
  } = order;
  void _cartIdentifier;
  void _verificationId;
  return rest;
}
