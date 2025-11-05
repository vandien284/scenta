import { head, put } from "@vercel/blob";
import { ProductType } from "@/types/ProductType";
// import { clearProductCache } from "./productSource";

const PRODUCT_BLOB_SOURCE =
  process.env.PRODUCTS_BLOB_URL ?? process.env.PRODUCTS_BLOB_PATH;
const PRODUCT_BLOB_PATH = process.env.PRODUCTS_BLOB_PATH;
const BLOB_TOKEN =
  process.env.VERCEL_BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_RW_TOKEN;

async function fetchProductsFromBlob(): Promise<ProductType[] | null> {
  if (!PRODUCT_BLOB_SOURCE) {
    throw new Error("PRODUCTS_BLOB_URL hoặc PRODUCTS_BLOB_PATH chưa được cấu hình.");
  }

  try {
    if (PRODUCT_BLOB_SOURCE.startsWith("http")) {
      const response = await fetch(PRODUCT_BLOB_SOURCE, {
        headers: BLOB_TOKEN
          ? {
              Authorization: `Bearer ${BLOB_TOKEN}`,
            }
          : undefined,
          cache: "no-store",
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

async function loadProductStore(): Promise<ProductType[]> {
  const blobProducts = await fetchProductsFromBlob();
  return blobProducts ?? [];
}

async function persistProducts(products: ProductType[]) {
  if (!PRODUCT_BLOB_PATH) {
    throw new Error("PRODUCTS_BLOB_PATH chưa được cấu hình để ghi dữ liệu.");
  }
  await put(
    PRODUCT_BLOB_PATH,
    JSON.stringify(products, null, 2),
    {
      access: "public",
      token: BLOB_TOKEN,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    }
  );

  // clearProductCache();
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

export async function loadProducts(): Promise<ProductType[]> {
  return loadProductStore();
}

function resolveNextProductId(products: ProductType[]): number {
  const maxId = products.reduce((max, product) => Math.max(max, Number(product.id) || 0), 0);
  return maxId + 1;
}

export interface ProductInput {
  name: string;
  url: string;
  categoriesId: number;
  price: number;
  images: string[];
  description?: string;
  bestSeller?: boolean;
  outstanding?: boolean;
  limited?: boolean;
  quantity: number;
  sale?: number;
  sold?: number;
}

export async function createProduct(input: ProductInput): Promise<ProductType> {
  const products = await loadProductStore();
  const id = resolveNextProductId(products);

  const product: ProductType = {
    id,
    name: input.name,
    url: input.url,
    categoriesId: input.categoriesId,
    price: input.price,
    images: input.images,
    description: input.description,
    bestSeller: input.bestSeller,
    outstanding: input.outstanding,
    limited: input.limited,
    quantity: input.quantity,
    sold: input.sold ?? 0,
    sale: input.sale,
  };

  products.push(product);
  await persistProducts(products);
  return product;
}

export async function updateProduct(id: number, changes: Partial<ProductInput>): Promise<ProductType> {
  const products = await loadProductStore();
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) {
    throw new Error(`Không tìm thấy sản phẩm với ID ${id}.`);
  }

  const current = products[index];
  const updated: ProductType = {
    ...current,
    ...changes,
    id,
    images: changes.images ?? current.images,
    sale: changes.sale ?? current.sale,
    sold: changes.sold ?? current.sold,
  };

  products[index] = updated;
  await persistProducts(products);
  return updated;
}

export async function deleteProduct(id: number): Promise<void> {
  const products = await loadProductStore();
  const filtered = products.filter((product) => product.id !== id);
  if (filtered.length === products.length) {
    throw new Error(`Không tìm thấy sản phẩm với ID ${id}.`);
  }
  await persistProducts(filtered);
}
