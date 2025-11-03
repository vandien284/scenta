import { NextResponse } from "next/server";
import { callChatCompletion, ChatMessage } from "@/lib/aiClient";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = body?.messages as ChatMessage[] | undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Lịch sử trò chuyện không hợp lệ." },
        { status: 400 }
      );
    }

    const systemMessage: ChatMessage = {
      role: "system",
      content:
        "Bạn là Scenta Assistant, một chuyên gia tư vấn sản phẩm nội thất và quà tặng cho thương hiệu Scenta. Luôn trả lời thân thiện, ngắn gọn và đề xuất các sản phẩm phù hợp từ cửa hàng.",
    };

    const aiResponse = await callChatCompletion([systemMessage, ...messages]);
    return NextResponse.json({ content: aiResponse });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[AI Chat] error:", error);
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể kết nối tới dịch vụ AI. Vui lòng thử lại sau.",
      },
      { status: 500 }
    );
  }
}
