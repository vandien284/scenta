import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CartResponse, CartItemSnapshot } from "@/types/CartType";
import { getAllProducts } from "@/lib/productSource";
import {
  getCartSnapshot,
  upsertCartSnapshot,
  removeCart,
  findCartItem,
} from "@/lib/cartSource";

const CART_COOKIE_NAME = "cart_id";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const IS_PRODUCTION = process.env.NODE_ENV === "production";

async function resolveCartIdentifier(): Promise<string> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CART_COOKIE_NAME)?.value;
  const sanitized = cookieValue ? sanitizeIdentifier(cookieValue) : "";
  if (sanitized) {
    return sanitized;
  }
  return sanitizeIdentifier(randomUUID());
}

function sanitizeIdentifier(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function attachCartCookie(response: NextResponse, identifier: string) {
  response.cookies.set({
    name: CART_COOKIE_NAME,
    value: identifier,
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
  return response;
}

function buildCartResponse(
  identifier: string,
  items: CartItemSnapshot[],
  productsMap: Map<number, ReturnType<typeof mapProduct>>
): CartResponse {
  const enriched = items
    .map((item) => {
      const product = productsMap.get(item.productId);
      if (!product) return null;

      const maxQuantity = product.available;
      const quantity = Math.min(Math.max(item.quantity, 0), maxQuantity);

      return {
        ...item,
        quantity,
        maxQuantity,
        availableQuantity: product.available,
        price: product.price,
        subtotal: quantity * product.price,
        name: product.name,
        url: product.url,
        image: product.image,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const totalQuantity = enriched.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = enriched.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    identifier,
    items: enriched,
    updatedAt: new Date().toISOString(),
    totalQuantity,
    totalPrice,
  };
}

function mapProduct(product: Awaited<ReturnType<typeof getAllProducts>>[number]) {
  const available = Math.max(product.quantity - product.sold, 0);
  return {
    id: product.id,
    name: product.name,
    url: product.url,
    price: product.price,
    image: product.images?.[0] ?? null,
    available,
    description: product.description,
  };
}

async function loadProductsMap() {
  const products = await getAllProducts();
  const map = new Map<number, ReturnType<typeof mapProduct>>();
  for (const product of products) {
    const value = mapProduct(product);
    map.set(product.id, value);
  }
  return map;
}

async function buildResponse(identifier: string) {
  const [cart, productsMap] = await Promise.all([getCartSnapshot(identifier), loadProductsMap()]);
  const response = buildCartResponse(identifier, cart.items, productsMap);
  return NextResponse.json(response);
}

export async function GET() {
  const identifier = await resolveCartIdentifier();
  try {
    const response = await buildResponse(identifier);
    return attachCartCookie(response, identifier);
  } catch (error) {
    console.error("[Cart API][GET]", error);
    return attachCartCookie(
      NextResponse.json(
        { error: "Unable to load cart information." },
        { status: 500 }
      ),
      identifier
    );
  }
}

export async function POST(request: Request) {
  const identifier = await resolveCartIdentifier();
  try {
    const { productId, quantity = 1 } = await request.json();
    if (!productId) {
      return attachCartCookie(
        NextResponse.json({ error: "Missing product to add." }, { status: 400 }),
        identifier
      );
    }

    const productsMap = await loadProductsMap();
    const product = productsMap.get(Number(productId));
    if (!product) {
      return attachCartCookie(
        NextResponse.json({ error: "Product not found." }, { status: 404 }),
        identifier
      );
    }

    if (product.available <= 0) {
      return attachCartCookie(
        NextResponse.json({ error: "This product is out of stock." }, { status: 400 }),
        identifier
      );
    }

    await upsertCartSnapshot(identifier, (cart) => {
      const now = new Date().toISOString();
      const existing = findCartItem(cart, product.id);
      const nextQuantity = existing
        ? Math.min(existing.quantity + Number(quantity || 0), product.available)
        : Math.min(Number(quantity || 0), product.available);

      if (existing) {
        existing.quantity = nextQuantity;
        existing.updatedAt = now;
      } else {
        const item: CartItemSnapshot = {
          productId: product.id,
          name: product.name,
          url: product.url,
          price: product.price,
          image: product.image,
          quantity: nextQuantity,
          addedAt: now,
          updatedAt: now,
        };
        cart.items = [...cart.items, item];
      }

      return cart;
    });

    const response = await buildResponse(identifier);
    return attachCartCookie(response, identifier);
  } catch (error) {
    console.error("[Cart API][POST]", error);
    return attachCartCookie(
      NextResponse.json(
        { error: error instanceof Error ? error.message : "Unable to add the product to cart." },
        { status: 500 }
      ),
      identifier
    );
  }
}

export async function PATCH(request: Request) {
  const identifier = await resolveCartIdentifier();
  try {
    const { productId, quantity = 1 } = await request.json();
    if (!productId) {
      return attachCartCookie(
        NextResponse.json({ error: "Missing product to update." }, { status: 400 }),
        identifier
      );
    }

    const productsMap = await loadProductsMap();
    const product = productsMap.get(Number(productId));
    if (!product) {
      return attachCartCookie(
        NextResponse.json({ error: "Product not found." }, { status: 404 }),
        identifier
      );
    }

    if (quantity <= 0) {
      await upsertCartSnapshot(identifier, (cart) => ({
        ...cart,
        items: cart.items.filter((item) => item.productId !== product.id),
      }));
      const response = await buildResponse(identifier);
      return attachCartCookie(response, identifier);
    }

    const desiredQuantity = Math.min(Number(quantity), product.available);
    await upsertCartSnapshot(identifier, (cart) => {
      const existing = findCartItem(cart, product.id);
      if (!existing) {
        if (desiredQuantity <= 0) return cart;
        const now = new Date().toISOString();
        const newItem: CartItemSnapshot = {
          productId: product.id,
          name: product.name,
          url: product.url,
          price: product.price,
          image: product.image,
          quantity: desiredQuantity,
          addedAt: now,
          updatedAt: now,
        };
        return { ...cart, items: [...cart.items, newItem] };
      }

      existing.quantity = desiredQuantity;
      existing.updatedAt = new Date().toISOString();
      return cart;
    });

    const response = await buildResponse(identifier);
    return attachCartCookie(response, identifier);
  } catch (error) {
    console.error("[Cart API][PATCH]", error);
    return attachCartCookie(
      NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Unable to update item quantity.",
        },
        { status: 500 }
      ),
      identifier
    );
  }
}

export async function DELETE(request: Request) {
  const identifier = await resolveCartIdentifier();
  try {
    const body = await request.json().catch(() => ({}));
    const productId = body?.productId;

    if (productId) {
      await upsertCartSnapshot(identifier, (cart) => ({
        ...cart,
        items: cart.items.filter((item) => item.productId !== Number(productId)),
      }));
      const response = await buildResponse(identifier);
      return attachCartCookie(response, identifier);
    }

    await removeCart(identifier);
    return attachCartCookie(
      NextResponse.json({
        identifier,
        items: [],
        updatedAt: new Date().toISOString(),
        totalQuantity: 0,
        totalPrice: 0,
      }),
      identifier
    );
  } catch (error) {
    console.error("[Cart API][DELETE]", error);
    return attachCartCookie(
      NextResponse.json(
        { error: "Unable to remove the product from cart." },
        { status: 500 }
      ),
      identifier
    );
  }
}
