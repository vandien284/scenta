import { NextResponse } from "next/server";
import { findOrderByCode, stripOrderSecrets } from "@/lib/orderSource";

export const runtime = "nodejs";

type ParamsInput = { params: { code: string } } | { params: Promise<{ code: string }> };

async function resolveParams(input: ParamsInput) {
  const raw = "params" in input ? input.params : undefined;
  if (!raw) return { code: "" };
  const value = typeof (raw as Promise<{ code: string }>).then === "function"
    ? await (raw as Promise<{ code: string }>)
    : (raw as { code: string });
  return value ?? { code: "" };
}

export async function GET(
  _request: Request,
  context: ParamsInput
) {
  try {
    const { code: rawCode } = await resolveParams(context);
    const code = rawCode?.toString() ?? "";
    if (!code) {
      return NextResponse.json({ error: "Thiếu mã đơn hàng." }, { status: 400 });
    }

    const order = await findOrderByCode(code);
    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
    }

    return NextResponse.json({ order: stripOrderSecrets(order) });
  } catch (error) {
    console.error("[orders][GET]", error);
    return NextResponse.json(
      { error: "Không thể tra cứu đơn hàng. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
