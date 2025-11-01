import { productData } from "@/data/ProductData";

export interface ProductFilter {
  page?: number;
  priceMin?: number;
  priceMax?: number;
  itemsPerPage?: number;
  cateId?: number;
}

export function getProducts({
  page = 1,
  priceMin = 0,
  priceMax = Infinity,
  itemsPerPage = 8,
  cateId = 0
}: ProductFilter) {

  const filtered = productData.filter(
    (p) => p.price >= priceMin && p.price <= priceMax && (cateId ? p.categoriesId === cateId : true)
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  return {
    products: filtered.slice(start, end),
    totalPages,
  };
}

export function getProductByUrl(url: string) {
  return productData.find((p) => p.url === url) || null;
}