import { getAllProducts } from "@/lib/productSource";

export interface ProductFilter {
  page?: number;
  priceMin?: number;
  priceMax?: number;
  itemsPerPage?: number;
  cateId?: number;
  q?: string;
  sort?: "name-asc" | "name-desc" | "price-asc" | "price-desc";
}

export async function getProducts({
  page = 1,
  priceMin = 0,
  priceMax = Infinity,
  itemsPerPage = 8,
  cateId = 0,
  q = "",
  sort,
}: ProductFilter) {
  const products = await getAllProducts();

  const filtered = products.filter((p) => {
    const matchPrice = p.price >= priceMin && p.price <= priceMax;
    const matchCate = cateId ? p.categoriesId === cateId : true;
    const matchQuery = q
      ? p.name.toLowerCase().includes(q.toLowerCase())
      : true;

    return matchPrice && matchCate && matchQuery;
  });

  const sorted = sortProducts(filtered, sort);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  return {
    products: sorted.slice(start, end),
    totalPages,
    totalProducts: sorted.length,
  };
}

function sortProducts(
  products: Awaited<ReturnType<typeof getAllProducts>>,
  sort?: ProductFilter["sort"]
) {
  if (!sort) return products;

  const copied = [...products];
  switch (sort) {
    case "name-asc":
      copied.sort((a, b) => a.name.localeCompare(b.name, "vi", { sensitivity: "base" }));
      break;
    case "name-desc":
      copied.sort((a, b) => b.name.localeCompare(a.name, "vi", { sensitivity: "base" }));
      break;
    case "price-asc":
      copied.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      copied.sort((a, b) => b.price - a.price);
      break;
    default:
      break;
  }
  return copied;
}


export async function getProductByUrl(url: string) {
  const products = await getAllProducts();
  return products.find((p) => p.url === url) || null;
}
