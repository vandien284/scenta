export interface FavoriteSnapshot {
  identifier: string;
  productIds: number[];
  updatedAt: string;
}

export interface FavoriteStoreSchema {
  favorites: Record<string, FavoriteSnapshot>;
}

export interface FavoriteResponse {
  identifier: string;
  productIds: number[];
  products: import("@/types/ProductType").ProductType[];
  updatedAt: string;
}
