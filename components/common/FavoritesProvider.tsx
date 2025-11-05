"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FavoriteResponse } from "@/types/FavoriteType";

interface FavoritesContextValue {
  favorites: FavoriteResponse | null;
  isLoading: boolean;
  isUpdating: boolean;
  refresh: () => Promise<void>;
  addFavorite: (productId: number) => Promise<void>;
  removeFavorite: (productId: number) => Promise<void>;
  toggleFavorite: (productId: number) => Promise<void>;
  clearFavorites: () => Promise<void>;
  isFavorite: (productId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

async function requestFavorites(
  method: "GET" | "POST" | "DELETE",
  body?: Record<string, unknown>
) {
  const url =
    method === "GET" ? `/api/favorites?ts=${Date.now()}` : "/api/favorites";

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    next: { revalidate: 0 },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Không thể xử lý yêu cầu yêu thích.");
  }

  return data as FavoriteResponse;
}

export default function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await requestFavorites("GET");
      setFavorites(data);
    } catch (error) {
      console.error("[FavoritesProvider] refresh error:", error);
      setFavorites(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const mutate = useCallback(
    async (method: "POST" | "DELETE", payload?: Record<string, unknown>) => {
      setIsUpdating(true);
      try {
        const data = await requestFavorites(method, payload);
        setFavorites(data);
        return data;
      } catch (error) {
        console.error("[FavoritesProvider] mutation error:", error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  const addFavorite = useCallback(
    (productId: number) => mutate("POST", { productId }),
    [mutate]
  );

  const removeFavorite = useCallback(
    (productId: number) => mutate("DELETE", { productId }),
    [mutate]
  );

  const toggleFavorite = useCallback(
    async (productId: number) => {
      const currentlyFavorite = favorites?.productIds.includes(productId) ?? false;
      if (currentlyFavorite) {
        await removeFavorite(productId);
      } else {
        await addFavorite(productId);
      }
    },
    [favorites?.productIds, addFavorite, removeFavorite]
  );

  const clearFavorites = useCallback(
    () => mutate("DELETE", { clear: true }),
    [mutate]
  );

  const isFavorite = useCallback(
    (productId: number) => favorites?.productIds.includes(productId) ?? false,
    [favorites?.productIds]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isLoading,
      isUpdating,
      refresh,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
      isFavorite,
    }),
    [
      favorites,
      isLoading,
      isUpdating,
      refresh,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      clearFavorites,
      isFavorite,
    ]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider.");
  }
  return context;
}
