"use server";

import { revalidatePath } from "next/cache";
import {
  createProduct,
  deleteProduct,
  ProductInput,
  updateProduct,
  loadProducts,
} from "@/lib/productInventory";
import type { ProductType } from "@/types/ProductType";

function parseNumber(value: FormDataEntryValue | null, defaultValue = 0): number {
  if (value === null) return defaultValue;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function parseBoolean(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true";
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
    throw new Error("Đường dẫn sản phẩm không được để trống.");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Giá sản phẩm không hợp lệ.");
  }

  const images = existingProduct?.images ? existingProduct.images.slice() : [];
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
