import { head, put } from "@vercel/blob";
import { CartSnapshot, CartStoreSchema, CartItemSnapshot } from "@/types/CartType";
import fallbackCartStore from "@/data/cartData.json";

const CART_BLOB_SOURCE = process.env.CARTS_BLOB_URL ?? process.env.CARTS_BLOB_PATH;
const CART_BLOB_PATH = process.env.CARTS_BLOB_PATH;
const BLOB_TOKEN = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;

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

async function loadStore(): Promise<CartStoreSchema> {
  const now = Date.now();
  if (cachedStore && now - lastFetchTime < CACHE_TTL) {
    return cachedStore;
  }

  if (!CART_BLOB_SOURCE) {
    cachedStore = JSON.parse(JSON.stringify(fallbackCartStore ?? { carts: {} })) as CartStoreSchema;
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

async function persistStore(store: CartStoreSchema) {
  if (!CART_BLOB_PATH) {
    throw new Error(
      "CARTS_BLOB_PATH is not configured. Unable to persist cart data to Vercel Blob."
    );
  }

  await put(
    CART_BLOB_PATH,
    JSON.stringify(store, null, 2),
    {
      access: "public",
      token: BLOB_TOKEN,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    }
  );

  cachedStore = store;
  lastFetchTime = Date.now();
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

  const { [identifier]: _, ...rest } = store.carts;
  const nextStore: CartStoreSchema = {
    carts: rest,
  };

  await persistStore(nextStore);
}

export function findCartItem(
  cart: CartSnapshot,
  productId: number
): CartItemSnapshot | undefined {
  return cart.items.find((item) => item.productId === productId);
}
