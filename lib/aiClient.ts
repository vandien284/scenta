export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const GEMINI_API_URL = process.env.GEMINI_API_URL ?? "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

function mapRole(role: "user" | "assistant") {
  return role === "assistant" ? "model" : "user";
}

export async function callChatCompletion(messages: ChatMessage[], options: ChatOptions = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Thiếu biến môi trường GEMINI_API_KEY.");
  }

  const systemInstruction = messages.find((msg) => msg.role === "system")?.content;
  const conversation = messages.filter((msg) => msg.role !== "system");

  const payload: Record<string, unknown> = {
    contents: conversation.map((msg) => ({
      role: mapRole(msg.role as "user" | "assistant"),
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 600,
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      role: "system",
      parts: [{ text: systemInstruction }],
    };
  }

  const endpoint = `${GEMINI_API_URL}/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Không nhận được phản hồi hợp lệ từ Gemini.");
  }

  return text as string;
}
