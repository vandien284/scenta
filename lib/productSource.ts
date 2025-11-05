"use server";

import { head } from "@vercel/blob";
import { ProductType } from "@/types/ProductType";

const BLOB_SOURCE = process.env.PRODUCTS_BLOB_URL ?? process.env.PRODUCTS_BLOB_PATH;
const BLOB_TOKEN =
  process.env.VERCEL_BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_RW_TOKEN;

async function fetchFromBlob(): Promise<ProductType[]> {
  if (!BLOB_SOURCE) {
    throw new Error("PRODUCTS_BLOB_URL hoặc PRODUCTS_BLOB_PATH chưa được cấu hình.");
  }

  if (BLOB_SOURCE.startsWith("http")) {
    const response = await fetch(BLOB_SOURCE, {
      headers: BLOB_TOKEN
        ? {
            Authorization: `Bearer ${BLOB_TOKEN}`,
          }
        : undefined,
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!response.ok) {
      throw new Error(`Không thể tải dữ liệu sản phẩm: ${response.statusText}`);
    }
    return (await response.json()) as ProductType[];
  }

  const blob = await head(BLOB_SOURCE, {
    token: BLOB_TOKEN,
  });
  const response = await fetch(blob.downloadUrl, {
    cache: "no-store",
    next: { revalidate: 0 },
  });
  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu sản phẩm: ${response.statusText}`);
  }
  return (await response.json()) as ProductType[];
}

export async function getAllProducts(): Promise<ProductType[]> {
  return fetchFromBlob();
}

// export function clearProductCache() {
//   // Không còn cache nội bộ; hàm giữ lại để tương thích với phần gọi hiện có.
// }
