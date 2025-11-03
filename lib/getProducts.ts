import { productData } from "@/data/ProductData";

export interface ProductFilter {
  page?: number;
  priceMin?: number;
  priceMax?: number;
  itemsPerPage?: number;
  cateId?: number;
  q?: string;
}

export function getProducts({
  page = 1,
  priceMin = 0,
  priceMax = Infinity,
  itemsPerPage = 8,
  cateId = 0,
  q = "",
}: ProductFilter) {
  const filtered = productData.filter((p) => {
    const matchPrice = p.price >= priceMin && p.price <= priceMax;
    const matchCate = cateId ? p.categoriesId === cateId : true;
    const matchQuery = q
      ? p.name.toLowerCase().includes(q.toLowerCase())
      : true;

    return matchPrice && matchCate && matchQuery;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  return {
    products: filtered.slice(start, end),
    totalPages,
    totalProducts: filtered.length,
  };
}


export function getProductByUrl(url: string) {
  return productData.find((p) => p.url === url) || null;
}