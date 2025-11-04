import { NextResponse } from "next/server";
import { createVerificationRecord } from "@/lib/verificationStore";
import { sendVerificationEmail } from "@/lib/email";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ." },
        { status: 400 }
      );
    }

    const { record, code } = await createVerificationRecord(email);
    const result = await sendVerificationEmail({
      to: email,
      code,
      name,
    });

    return NextResponse.json({
      verificationId: record.id,
      email,
      expiresAt: record.expiresAt,
      sent: result.sent,
      message: result.sent ? undefined : result.message,
    });
  } catch (error) {
    console.error("[checkout][send-code]", error);
    return NextResponse.json(
      { error: "Không thể gửi mã xác thực. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
