import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/productSource";
import {
  getFavoriteSnapshot,
  removeFavoriteSnapshot,
  upsertFavoriteSnapshot,
} from "@/lib/favoriteSource";

function sanitizeIdentifier(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function resolveClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0]?.trim();
    if (ip) {
      return sanitizeIdentifier(ip);
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return sanitizeIdentifier(realIp);
  }

  const forwarded = request.headers.get("forwarded");
  if (forwarded) {
    const forMatch = forwarded.match(/for="?([^;"]+)"?/i);
    if (forMatch?.[1]) {
      return sanitizeIdentifier(forMatch[1]);
    }
  }

  return "unknown";
}

async function loadProductsMap() {
  const products = await getAllProducts();
  const map = new Map<number, Awaited<ReturnType<typeof getAllProducts>>[number]>();
  for (const product of products) {
    map.set(product.id, product);
  }
  return map;
}

async function buildFavoriteResponse(identifier: string) {
  const [snapshot, productsMap] = await Promise.all([
    getFavoriteSnapshot(identifier),
    loadProductsMap(),
  ]);

  const products = snapshot.productIds
    .map((id) => productsMap.get(id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  return {
    identifier,
    productIds: snapshot.productIds,
    products,
    updatedAt: snapshot.updatedAt,
  };
}

export async function GET(request: Request) {
  try {
    const identifier = resolveClientIdentifier(request);
    const response = await buildFavoriteResponse(identifier);
    return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[favorites][GET]", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách yêu thích." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const identifier = resolveClientIdentifier(request);
    const payload = await request.json().catch(() => ({}));
    const productId = Number(payload?.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Thiếu mã sản phẩm hợp lệ." },
        { status: 400 }
      );
    }

    const products = await getAllProducts();
    const productExists = products.some((product) => product.id === productId);
    if (!productExists) {
      return NextResponse.json(
        { error: "Sản phẩm không tồn tại." },
        { status: 404 }
      );
    }

    await upsertFavoriteSnapshot(identifier, (snapshot) => {
      if (!snapshot.productIds.includes(productId)) {
        snapshot.productIds = [...snapshot.productIds, productId];
      }
      return snapshot;
    });

    const response = await buildFavoriteResponse(identifier);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("[favorites][POST]", error);
    return NextResponse.json(
      { error: "Không thể thêm sản phẩm yêu thích." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const identifier = resolveClientIdentifier(request);
    const payload = await request.json().catch(() => ({}));
    const productId = Number(payload?.productId);

    if (payload?.clear === true) {
      await removeFavoriteSnapshot(identifier);
      const response = await buildFavoriteResponse(identifier);
      return NextResponse.json(response);
    }

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Thiếu mã sản phẩm hợp lệ." },
        { status: 400 }
      );
    }

    await upsertFavoriteSnapshot(identifier, (snapshot) => {
      snapshot.productIds = snapshot.productIds.filter((id) => id !== productId);
      return snapshot;
    });

    const response = await buildFavoriteResponse(identifier);
    return NextResponse.json(response);
  } catch (error) {
    console.error("[favorites][DELETE]", error);
    return NextResponse.json(
      { error: "Không thể xóa sản phẩm yêu thích." },
      { status: 500 }
    );
  }
}
