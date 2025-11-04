import { head, put } from "@vercel/blob";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import { CartSnapshot, CartStoreSchema, CartItemSnapshot } from "@/types/CartType";
import fallbackCartStore from "@/data/cartData.json";

const CART_BLOB_SOURCE = process.env.CARTS_BLOB_URL ?? process.env.CARTS_BLOB_PATH;
const CART_BLOB_PATH = process.env.CARTS_BLOB_PATH;
const BLOB_TOKEN =  process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_CART_PATH = path.join(process.cwd(), "data", "cartData.json");

let cachedStore: CartStoreSchema | null = null;
let lastFetchTime = 0;

const CACHE_TTL = 30_000; // 30 seconds

async function downloadBlobJson(url: string) {
  const response = await fetch(url, { next: { revalidate: 0 } });
  if (!response.ok) {
    throw new Error(`Failed to fetch cart store: ${response.statusText}`);
  }
  return (await response.json()) as CartStoreSchema;
}

async function readLocalStore(): Promise<CartStoreSchema> {
  try {
    const raw = await readFile(LOCAL_CART_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<CartStoreSchema> | null;
    if (!parsed || typeof parsed !== "object" || !parsed.carts) {
      return JSON.parse(JSON.stringify(fallbackCartStore ?? { carts: {} })) as CartStoreSchema;
    }
    return { carts: parsed.carts };
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return JSON.parse(JSON.stringify(fallbackCartStore ?? { carts: {} })) as CartStoreSchema;
    }
    console.error("[cartSource] Unable to read local cart store:", err);
    return JSON.parse(JSON.stringify(fallbackCartStore ?? { carts: {} })) as CartStoreSchema;
  }
}

async function loadStore(): Promise<CartStoreSchema> {
  const now = Date.now();
  if (cachedStore && now - lastFetchTime < CACHE_TTL) {
    return cachedStore;
  }

  if (!CART_BLOB_SOURCE) {
    const localStore = await readLocalStore();
    cachedStore = JSON.parse(JSON.stringify(localStore ?? { carts: {} })) as CartStoreSchema;
    lastFetchTime = now;
    return cachedStore;
  }

  try {
    if (CART_BLOB_SOURCE.startsWith("http")) {
      cachedStore = await downloadBlobJson(CART_BLOB_SOURCE);
    } else {
      const blob = await head(CART_BLOB_SOURCE, {
        token: BLOB_TOKEN,
      });
      cachedStore = await downloadBlobJson(blob.downloadUrl);
    }
  } catch (error) {
    console.warn("[cartSource] Fallback to local cart store:", error);
    cachedStore = JSON.parse(JSON.stringify(fallbackCartStore ?? { carts: {} })) as CartStoreSchema;
  }

  lastFetchTime = now;
  return cachedStore;
}

async function writeLocal(store: CartStoreSchema) {
  await writeFile(LOCAL_CART_PATH, JSON.stringify(store, null, 2), "utf-8");
}

async function persistStore(store: CartStoreSchema) {
  await writeLocal(store);

  cachedStore = JSON.parse(JSON.stringify(store)) as CartStoreSchema;
  lastFetchTime = Date.now();

  if (CART_BLOB_PATH) {
    void put(
      CART_BLOB_PATH,
      JSON.stringify(store, null, 2),
      {
        access: "public",
        token: BLOB_TOKEN,
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      }
    ).catch((error) => {
      console.error("[cartSource] Unable to persist to blob:", error);
    });
  }
}

function createEmptyCart(identifier: string): CartSnapshot {
  return {
    identifier,
    items: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function getCartSnapshot(identifier: string): Promise<CartSnapshot> {
  const store = await loadStore();
  return store.carts[identifier] ?? createEmptyCart(identifier);
}

export async function upsertCartSnapshot(
  identifier: string,
  mutate: (current: CartSnapshot) => CartSnapshot
): Promise<CartSnapshot> {
  const store = await loadStore();
  const current = store.carts[identifier] ?? createEmptyCart(identifier);
  const next = mutate(current);

  const sanitizedItems = next.items.filter((item) => item.quantity > 0);
  const finalSnapshot: CartSnapshot = {
    identifier,
    items: sanitizedItems,
    updatedAt: new Date().toISOString(),
  };

  const nextStore: CartStoreSchema = {
    carts: {
      ...store.carts,
      [identifier]: finalSnapshot,
    },
  };

  await persistStore(nextStore);
  return finalSnapshot;
}

export async function overwriteCartSnapshot(identifier: string, snapshot: CartSnapshot) {
  const store = await loadStore();
  const nextStore: CartStoreSchema = {
    carts: {
      ...store.carts,
      [identifier]: {
        ...snapshot,
        items: snapshot.items.filter((item) => item.quantity > 0),
        updatedAt: new Date().toISOString(),
      },
    },
  };
  await persistStore(nextStore);
}

export async function removeCart(identifier: string) {
  const store = await loadStore();
  if (!(identifier in store.carts)) {
    return;
  }

  const nextCarts = { ...store.carts };
  delete nextCarts[identifier];

  await persistStore({
    carts: nextCarts,
  });
}

export function findCartItem(
  cart: CartSnapshot,
  productId: number
): CartItemSnapshot | undefined {
  return cart.items.find((item) => item.productId === productId);
}
