import { head, put } from "@vercel/blob";
import { FavoriteSnapshot, FavoriteStoreSchema } from "@/types/FavoriteType";

const FAVORITES_BLOB_SOURCE =
  process.env.FAVORITES_BLOB_URL ?? process.env.FAVORITES_BLOB_PATH;
const FAVORITES_BLOB_PATH = process.env.FAVORITES_BLOB_PATH;
const BLOB_TOKEN =
  process.env.VERCEL_BLOB_READ_WRITE_TOKEN ??
  process.env.BLOB_READ_WRITE_TOKEN ??
  process.env.BLOB_RW_TOKEN;

const CACHE_TTL = 30_000;

let cachedStore: FavoriteStoreSchema | null = null;
let lastFetchTime = 0;

function ensureStoreShape(value: unknown): FavoriteStoreSchema {
  if (typeof value === "object" && value !== null && "favorites" in value) {
    const store = value as { favorites?: unknown };
    if (
      store.favorites &&
      typeof store.favorites === "object" &&
      !Array.isArray(store.favorites)
    ) {
      return {
        favorites: store.favorites as Record<string, FavoriteSnapshot>,
      };
    }
  }
  return { favorites: {} };
}

async function downloadBlobJson(url: string) {
  const response = await fetch(url, { cache: "no-store", next: { revalidate: 0 } });
  if (!response.ok) {
    throw new Error(`Failed to fetch favorites store: ${response.statusText}`);
  }
  const data = await response.json();
  return ensureStoreShape(data);
}

async function loadFromBlob(): Promise<FavoriteStoreSchema> {
  if (!FAVORITES_BLOB_SOURCE) {
    throw new Error("FAVORITES_BLOB_URL hoặc FAVORITES_BLOB_PATH chưa được cấu hình.");
  }

  if (FAVORITES_BLOB_SOURCE.startsWith("http")) {
    return downloadBlobJson(FAVORITES_BLOB_SOURCE);
  }

  const blob = await head(FAVORITES_BLOB_SOURCE, {
    token: BLOB_TOKEN,
  });
  return downloadBlobJson(blob.downloadUrl);
}

async function loadStore(): Promise<FavoriteStoreSchema> {
  const now = Date.now();
  if (cachedStore && now - lastFetchTime < CACHE_TTL) {
    return cachedStore;
  }

  try {
    cachedStore = await loadFromBlob();
  } catch (error) {
    console.error("[favoriteSource] Unable to load store:", error);
    cachedStore = { favorites: {} };
  }
  lastFetchTime = now;
  return cachedStore;
}

async function persistStore(store: FavoriteStoreSchema) {
  if (!FAVORITES_BLOB_PATH) {
    throw new Error("FAVORITES_BLOB_PATH chưa được cấu hình để ghi dữ liệu.");
  }

  await put(
    FAVORITES_BLOB_PATH,
    JSON.stringify(store, null, 2),
    {
      access: "public",
      token: BLOB_TOKEN,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    }
  );

  cachedStore = JSON.parse(JSON.stringify(store)) as FavoriteStoreSchema;
  lastFetchTime = Date.now();
  return cachedStore;
}

function createEmptySnapshot(identifier: string): FavoriteSnapshot {
  return {
    identifier,
    productIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function getFavoriteSnapshot(identifier: string): Promise<FavoriteSnapshot> {
  const store = await loadStore();
  return store.favorites[identifier] ?? createEmptySnapshot(identifier);
}

export async function upsertFavoriteSnapshot(
  identifier: string,
  mutate: (current: FavoriteSnapshot) => FavoriteSnapshot
) {
  const store = await loadStore();
  const current = store.favorites[identifier] ?? createEmptySnapshot(identifier);
  const next = mutate(current);

  const sanitized: FavoriteSnapshot = {
    identifier,
    productIds: Array.from(new Set(next.productIds)).filter(
      (value): value is number => Number.isInteger(value) && value > 0
    ),
    updatedAt: new Date().toISOString(),
  };

  const nextStore: FavoriteStoreSchema = {
    favorites: {
      ...store.favorites,
      [identifier]: sanitized,
    },
  };

  await persistStore(nextStore);
  return sanitized;
}

export async function removeFavoriteSnapshot(identifier: string) {
  const store = await loadStore();
  if (!(identifier in store.favorites)) {
    return;
  }

  const nextFavorites = { ...store.favorites };
  delete nextFavorites[identifier];
  await persistStore({ favorites: nextFavorites });
}

export function clearFavoriteCache() {
  cachedStore = null;
  lastFetchTime = 0;
}
