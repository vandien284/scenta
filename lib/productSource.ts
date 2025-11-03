import { head } from "@vercel/blob";
import { ProductType } from "@/types/ProductType";
import { productData as fallbackProductData } from "@/data/ProductData";

let cachedProducts: ProductType[] | null = null;

const BLOB_SOURCE = process.env.PRODUCTS_BLOB_URL || process.env.PRODUCTS_BLOB_PATH;
const BLOB_TOKEN = process.env.VERCEL_BLOB_READ_WRITE_TOKEN;

async function fetchFromBlob(): Promise<ProductType[] | null> {
  if (!BLOB_SOURCE) {
    return null;
  }

  try {
    if (BLOB_SOURCE.startsWith("http")) {
      const response = await fetch(BLOB_SOURCE, {
        headers: BLOB_TOKEN
          ? {
              Authorization: `Bearer ${BLOB_TOKEN}`,
            }
          : undefined,
        next: { revalidate: 60 },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch blob data: ${response.statusText}`);
      }
      return (await response.json()) as ProductType[];
    }

    const blob = await head(BLOB_SOURCE, {
      token: BLOB_TOKEN,
    });
    const response = await fetch(blob.downloadUrl, { next: { revalidate: 60 } });
    if (!response.ok) {
      throw new Error(`Failed to download blob: ${response.statusText}`);
    }
    return (await response.json()) as ProductType[];
  } catch (error) {
    console.warn("[productSource] Không thể đọc dữ liệu sản phẩm từ Vercel Blob:", error);
    return null;
  }
}

export async function getAllProducts(): Promise<ProductType[]> {
  if (cachedProducts) {
    return cachedProducts;
  }

  const blobProducts = await fetchFromBlob();
  cachedProducts = blobProducts ?? fallbackProductData;
  return cachedProducts;
}

export function clearProductCache() {
  cachedProducts = null;
}
