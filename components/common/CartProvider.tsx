"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CartResponse } from "@/types/CartType";

interface CartContextValue {
  cart: CartResponse | null;
  isLoading: boolean;
  isUpdating: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

async function requestCart(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: Record<string, unknown>
) {
  const url =
    method === "GET" ? `/api/cart?ts=${Date.now()}` : "/api/cart";
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
    cache: "no-store",
    next: { revalidate: 0 },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Unable to process cart request.");
  }

  return data as CartResponse;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await requestCart("GET");
      setCart(data);
    } catch (error) {
      console.error("[CartProvider] refresh error:", error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleMutation = useCallback(
    async (method: "POST" | "PATCH" | "DELETE", payload: Record<string, unknown>) => {
      setIsUpdating(true);
      try {
        const data = await requestCart(method, payload);
        setCart(data);
      } catch (error) {
        console.error("[CartProvider] mutation error:", error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  const addItem = useCallback(
    (productId: number, quantity = 1) =>
      handleMutation("POST", { productId, quantity, action: "add" }),
    [handleMutation]
  );

  const updateItem = useCallback(
    (productId: number, quantity: number) =>
      handleMutation("PATCH", { productId, quantity, action: "update" }),
    [handleMutation]
  );

  const removeItem = useCallback(
    (productId: number) => handleMutation("DELETE", { productId, action: "remove" }),
    [handleMutation]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      isUpdating,
      refresh,
      addItem,
      updateItem,
      removeItem,
    }),
    [cart, isLoading, isUpdating, refresh, addItem, updateItem, removeItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }
  return context;
}
