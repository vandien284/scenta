export interface CartItemSnapshot {
  productId: number;
  name: string;
  url: string;
  price: number;
  image?: string | null;
  quantity: number;
  addedAt: string;
  updatedAt: string;
}

export interface CartSnapshot {
  identifier: string;
  items: CartItemSnapshot[];
  updatedAt: string;
}

export interface CartStoreSchema {
  carts: Record<string, CartSnapshot>;
}

export interface CartItemResponse extends CartItemSnapshot {
  maxQuantity: number;
  availableQuantity: number;
  subtotal: number;
}

export interface CartResponse {
  identifier: string;
  items: CartItemResponse[];
  updatedAt: string;
  totalQuantity: number;
  totalPrice: number;
}
