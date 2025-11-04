import { head, put } from "@vercel/blob";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import { OrderSchema, OrderStoreSchema } from "@/types/OrderType";

const ORDER_BLOB_SOURCE = process.env.ORDERS_BLOB_URL;
const ORDER_BLOB_PATH = process.env.ORDERS_BLOB_PATH;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const LOCAL_ORDER_PATH = path.join(process.cwd(), "data", "orderData.json");

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

async function readLocalStore(): Promise<OrderStoreSchema> {
  try {
    const raw = await readFile(LOCAL_ORDER_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<OrderStoreSchema> | null;
    if (!parsed || !Array.isArray(parsed.orders)) {
      return { orders: [] };
    }
    return { orders: parsed.orders };
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return { orders: [] };
    }
    console.error("[orderSource] Unable to read local order store:", err);
    return { orders: [] };
  }
}

async function loadStore(): Promise<OrderStoreSchema> {
  const now = Date.now();
  if (cachedStore && now - lastFetchTime < CACHE_TTL) {
    return cachedStore;
  }

  const blobStore = await fetchFromBlob();
  const store = blobStore ?? (await readLocalStore());

  cachedStore = {
    orders: Array.isArray(store.orders) ? [...store.orders] : [],
  };
  lastFetchTime = now;

  return cachedStore;
}

async function writeLocal(store: OrderStoreSchema) {
  await writeFile(LOCAL_ORDER_PATH, JSON.stringify(store, null, 2), "utf-8");
}

async function persistStore(store: OrderStoreSchema) {
  await writeLocal(store);

  cachedStore = { orders: [...store.orders] };
  lastFetchTime = Date.now();

  if (ORDER_BLOB_PATH) {
    void put(
      ORDER_BLOB_PATH,
      JSON.stringify(store, null, 2),
      {
        access: "public",
        token: BLOB_TOKEN,
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      }
    ).catch((error) => {
      console.error("[orderSource] Unable to persist to blob:", error);
    });
  }
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
