import { NextResponse } from "next/server";
import { createReview, getAllReviews, getReviewsByProductSlug } from "@/lib/reviewSource";

function parseLimit(param: string | null): number | undefined {
  if (!param) return undefined;
  const value = Number.parseInt(param, 10);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function sortReviewsByDate(reviews: Awaited<ReturnType<typeof getAllReviews>>) {
  return [...reviews].sort((a, b) => {
    const timeA = Date.parse(a.createdAt ?? "");
    const timeB = Date.parse(b.createdAt ?? "");
    return (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA);
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productSlug = searchParams.get("productSlug");
    const limit = parseLimit(searchParams.get("limit"));

    const reviews = productSlug
      ? await getReviewsByProductSlug(productSlug)
      : await getAllReviews();

    const sorted = sortReviewsByDate(reviews);
    const data = typeof limit === "number" ? sorted.slice(0, limit) : sorted;

    return NextResponse.json({ reviews: data });
  } catch (error) {
    console.error("[reviews][GET]", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách đánh giá." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {
      productId,
      productSlug,
      productName,
      reviewerName,
      rating,
      content,
    } = payload ?? {};

    if (!productSlug || !productName || !reviewerName || !content) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc." },
        { status: 400 }
      );
    }

    const review = await createReview({
      productId: typeof productId === "number" ? productId : undefined,
      productSlug: String(productSlug),
      productName: String(productName),
      reviewerName: String(reviewerName),
      rating: Number(rating),
      content: String(content),
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("[reviews][POST]", error);
    return NextResponse.json(
      { error: "Không thể lưu đánh giá. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
