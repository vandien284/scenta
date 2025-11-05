import { head, put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { CreateReviewPayload, ReviewStoreSchema, ReviewType } from "@/types/ReviewType";

const REVIEW_BLOB_SOURCE = process.env.REVIEWS_BLOB_URL ?? process.env.REVIEWS_BLOB_PATH;
const REVIEW_BLOB_PATH = process.env.REVIEWS_BLOB_PATH;
const BLOB_TOKEN =
  process.env.VERCEL_BLOB_READ_WRITE_TOKEN ??
  process.env.BLOB_READ_WRITE_TOKEN ??
  process.env.BLOB_RW_TOKEN;

const CACHE_TTL = 30_000;

let cachedStore: ReviewStoreSchema | null = null;
let lastFetchTime = 0;

function ensureStoreShape(value: unknown): ReviewStoreSchema {
  if (!value) {
    return { reviews: [] };
  }

  if (Array.isArray(value)) {
    return { reviews: value as ReviewType[] };
  }

  if (typeof value === "object" && "reviews" in value) {
    const store = value as { reviews?: unknown };
    if (Array.isArray(store.reviews)) {
      return { reviews: store.reviews as ReviewType[] };
    }
  }

  return { reviews: [] };
}

async function downloadBlobJson(url: string) {
  const response = await fetch(url, { next: { revalidate: 0 }, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch review store: ${response.statusText}`);
  }
  return ensureStoreShape(await response.json());
}

async function loadFromBlob(): Promise<ReviewStoreSchema> {
  if (!REVIEW_BLOB_SOURCE) {
    throw new Error("REVIEWS_BLOB_URL hoặc REVIEWS_BLOB_PATH chưa được cấu hình.");
  }

  if (REVIEW_BLOB_SOURCE.startsWith("http")) {
    return downloadBlobJson(REVIEW_BLOB_SOURCE);
  }

  const blob = await head(REVIEW_BLOB_SOURCE, {
    token: BLOB_TOKEN,
  });
  return downloadBlobJson(blob.downloadUrl);
}



async function loadStore(): Promise<ReviewStoreSchema> {
  const now = Date.now();
  if (cachedStore && now - lastFetchTime < CACHE_TTL) {
    return cachedStore;
  }

  try {
    cachedStore = await loadFromBlob();
  } catch (error) {
    console.error("[reviewSource] Unable to load review store:", error);
    cachedStore = { reviews: [] };
  }

  lastFetchTime = now;
  return cachedStore;
}

async function persistStore(store: ReviewStoreSchema) {
  if (!REVIEW_BLOB_PATH) {
    throw new Error("REVIEWS_BLOB_PATH chưa được cấu hình để ghi dữ liệu.");
  }

  await put(
    REVIEW_BLOB_PATH,
    JSON.stringify(store, null, 2),
    {
      access: "public",
      token: BLOB_TOKEN,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    }
  );

  cachedStore = JSON.parse(JSON.stringify(store)) as ReviewStoreSchema;
  lastFetchTime = Date.now();
  return cachedStore;
}

export async function getAllReviews(): Promise<ReviewType[]> {
  const store = await loadStore();
  return store.reviews;
}

export async function getReviewsByProductSlug(productSlug: string): Promise<ReviewType[]> {
  if (!productSlug) {
    return [];
  }
  const store = await loadStore();
  return store.reviews.filter((review) => review.productSlug === productSlug);
}

export async function createReview(payload: CreateReviewPayload): Promise<ReviewType> {
  const store = await loadStore();

  const sanitizedRating = Number.isFinite(payload.rating)
    ? Math.min(5, Math.max(1, Math.round(payload.rating)))
    : 5;

  const now = new Date().toISOString();
  const review: ReviewType = {
    id: randomUUID(),
    productId: payload.productId,
    productSlug: payload.productSlug,
    productName: payload.productName,
    reviewerName: payload.reviewerName.trim(),
    rating: sanitizedRating,
    content: payload.content.trim(),
    avatar: payload.avatar,
    role: payload.role,
    createdAt: now,
  };

  const nextStore: ReviewStoreSchema = {
    reviews: [review, ...store.reviews],
  };

  await persistStore(nextStore);
  return review;
}

export function clearReviewCache() {
  cachedStore = null;
  lastFetchTime = 0;
}
