"use server";

import { getProductByUrl, getProducts } from "@/lib/getProducts";

export async function getProductsAction(params: {
  page?: number;
  priceMin?: number;
  priceMax?: number;
  cateId?: number;
}) {
  return getProducts(params);
}

export async function getProductByUrlAction(url: string) {
  return getProductByUrl(url);
}