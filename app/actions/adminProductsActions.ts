"use server";

import { revalidatePath } from "next/cache";
import path from "path";
import { promises as fs } from "fs";
import {
  createProduct,
  deleteProduct,
  ProductInput,
  updateProduct,
  loadProducts,
} from "@/lib/productInventory";
import { slugify } from "@/utils/slugify";
import type { ProductType } from "@/types/ProductType";

async function saveCompressedImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
  }

  let sharp: typeof import("sharp").default;
  try {
    sharp = (await import("sharp")).default;
  } catch (error) {
    console.error("[adminProductsActions] Missing sharp dependency", error);
    throw new Error("Vui lòng cài đặt thư viện 'sharp' để xử lý hình ảnh (npm install sharp).");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || `image-${Date.now()}`;
  const fileName = `${baseName}-${Date.now()}.webp`;
  const outputDir = path.join(process.cwd(), "public", "images", "product");
  const outputPath = path.join(outputDir, fileName);

  await fs.mkdir(outputDir, { recursive: true });

  await sharp(buffer)
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return `/images/product/${fileName}`;
}

function parseNumber(value: FormDataEntryValue | null, defaultValue = 0): number {
  if (value === null) return defaultValue;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function parseBoolean(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true";
}

function parseKeptImages(formData: FormData, existingImages: string[] = []): string[] {
  const entries = formData.getAll("keepImage").map(String);
  if (!entries.length) {
    return existingImages.slice();
  }
  const keepSet = new Set(entries);
  return existingImages.filter((src) => keepSet.has(src));
}

async function buildProductInput(formData: FormData, existingProduct?: ProductType): Promise<ProductInput> {
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const categoriesId = parseNumber(formData.get("categoriesId"));
  const price = parseNumber(formData.get("price"));
  const quantity = parseNumber(formData.get("quantity"), 0);
  const sale = formData.get("sale");
  const description = String(formData.get("description") ?? "");
  const sold = existingProduct ? existingProduct.sold ?? 0 : parseNumber(formData.get("sold"), 0);

  if (!name) {
    throw new Error("Tên sản phẩm không được để trống.");
  }

  if (!url) {
    throw new Error("Url sản phẩm không được để trống.");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Giá sản phẩm không hợp lệ.");
  }

  const keptImages = parseKeptImages(formData, existingProduct?.images ?? []);
  const images = [...keptImages];
  const newImageFiles = formData.getAll("newImages").filter((entry): entry is File => entry instanceof File && entry.size > 0);

  for (const file of newImageFiles) {
    const url = await saveCompressedImage(file);
    if (url) {
      images.push(url);
    }
  }

  const saleNumber = sale !== null && sale !== "" ? Math.max(0, Math.min(100, Number(sale))) : undefined;

  return {
    name,
    url,
    categoriesId,
    price,
    images,
    description: description || undefined,
    bestSeller: parseBoolean(formData.get("bestSeller")),
    outstanding: parseBoolean(formData.get("outstanding")),
    limited: parseBoolean(formData.get("limited")),
    quantity,
    sale: saleNumber,
    sold: Number.isFinite(sold) ? sold : 0,
  };
}

function revalidateProducts() {
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/san-pham");
}

export async function createProductAction(formData: FormData) {
  const input = await buildProductInput(formData);
  await createProduct(input);
  revalidateProducts();
}

export async function updateProductAction(formData: FormData) {
  const id = parseNumber(formData.get("productId"));
  if (!id) {
    throw new Error("Thiếu mã sản phẩm.");
  }

  const products = await loadProducts();
  const existing = products.find((product) => product.id === id);
  if (!existing) {
    throw new Error("Không tìm thấy sản phẩm để cập nhật.");
  }

  const input = await buildProductInput(formData, existing);
  await updateProduct(id, input);
  revalidateProducts();
}

export async function deleteProductAction(formData: FormData) {
  const id = parseNumber(formData.get("productId"));
  if (!id) {
    throw new Error("Thiếu mã sản phẩm để xóa.");
  }

  await deleteProduct(id);
  revalidateProducts();
}
