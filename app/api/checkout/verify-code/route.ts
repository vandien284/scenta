import { NextResponse } from "next/server";
import { verifyRecordCode } from "@/lib/verificationStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const verificationId =
      typeof body?.verificationId === "string" ? body.verificationId.trim() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";

    if (!verificationId || !code) {
      return NextResponse.json(
        { error: "Thiếu mã xác thực hoặc mã kiểm tra." },
        { status: 400 }
      );
    }

    const result = await verifyRecordCode(verificationId, code);
    if (!result.ok) {
      const reason = result.reason;
      if (reason === "not_found" || reason === "consumed") {
        return NextResponse.json({ error: "Mã xác thực không tồn tại." }, { status: 404 });
      }

      if (reason === "expired") {
        return NextResponse.json({ error: "Mã xác thực đã hết hạn." }, { status: 410 });
      }

      if (reason === "locked") {
        return NextResponse.json(
          { error: "Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới." },
          { status: 423 }
        );
      }

      return NextResponse.json(
        { error: "Mã xác thực không chính xác." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verificationId,
      verifiedAt: result.record.verifiedAt,
    });
  } catch (error) {
    console.error("[checkout][verify-code]", error);
    return NextResponse.json(
      { error: "Không thể kiểm tra mã xác thực. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
