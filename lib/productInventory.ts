import { head, put } from "@vercel/blob";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import { ProductType } from "@/types/ProductType";
import { clearProductCache } from "./productSource";

const PRODUCT_BLOB_SOURCE =  process.env.PRODUCTS_BLOB_URL;
const PRODUCT_BLOB_PATH = process.env.PRODUCTS_BLOB_PATH;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const LOCAL_PRODUCT_PATH = path.join(process.cwd(), "data", "productData.json");

async function fetchProductsFromBlob(): Promise<ProductType[] | null> {
  if (!PRODUCT_BLOB_SOURCE) {
    return null;
  }

  try {
    if (PRODUCT_BLOB_SOURCE.startsWith("http")) {
      const response = await fetch(PRODUCT_BLOB_SOURCE, {
        headers: BLOB_TOKEN
          ? {
              Authorization: `Bearer ${BLOB_TOKEN}`,
            }
          : undefined,
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch product blob: ${response.statusText}`);
      }

      return (await response.json()) as ProductType[];
    }

    const blob = await head(PRODUCT_BLOB_SOURCE, {
      token: BLOB_TOKEN,
    });

    const response = await fetch(blob.downloadUrl, { next: { revalidate: 0 } });
    if (!response.ok) {
      throw new Error(`Failed to download product blob: ${response.statusText}`);
    }

    return (await response.json()) as ProductType[];
  } catch (error) {
    console.warn("[productInventory] Unable to load product store from blob:", error);
    return null;
  }
}

async function readLocalProducts(): Promise<ProductType[]> {
  try {
    const raw = await readFile(LOCAL_PRODUCT_PATH, "utf-8");
    const parsed = JSON.parse(raw) as ProductType[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return [];
    }
    console.error("[productInventory] Unable to read local product data:", err);
    return [];
  }
}

async function loadProductStore(): Promise<ProductType[]> {
  const blobProducts = await fetchProductsFromBlob();
  if (blobProducts) {
    return blobProducts;
  }
  return readLocalProducts();
}

async function writeLocalProducts(products: ProductType[]) {
  await writeFile(LOCAL_PRODUCT_PATH, JSON.stringify(products, null, 2), "utf-8");
}

async function persistProducts(products: ProductType[]) {
  await writeLocalProducts(products);

  if (PRODUCT_BLOB_PATH) {
    void put(
      PRODUCT_BLOB_PATH,
      JSON.stringify(products, null, 2),
      {
        access: "public",
        token: BLOB_TOKEN,
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      }
    ).catch((error) => {
      console.error("[productInventory] Unable to persist to blob:", error);
    });
  }

  clearProductCache();
}

export async function applyInventoryAdjustments(
  adjustments: Array<{ productId: number; quantity: number }>
) {
  if (adjustments.length === 0) {
    return;
  }

  const products = await loadProductStore();
  const productMap = new Map(products.map((product) => [product.id, product]));

  for (const { productId, quantity } of adjustments) {
    const product = productMap.get(productId);
    if (!product) {
      throw new Error(`Không tìm thấy sản phẩm với ID ${productId}.`);
    }

    const available = Math.max(product.quantity - product.sold, 0);
    if (quantity > available) {
      throw new Error(
        `Sản phẩm "${product.name}" không đủ tồn kho. Còn lại ${available}, yêu cầu ${quantity}.`
      );
    }

    product.sold += quantity;
  }

  await persistProducts(products);
}
