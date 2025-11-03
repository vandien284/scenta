import { NextResponse } from "next/server";
import { callChatCompletion, ChatMessage } from "@/lib/aiClient";
import { getAllProducts } from "@/lib/productSource";

export const runtime = "edge";

interface RawSuggestion {
  productName?: string;
  reason?: string;
  cardMessage?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, birthDate, gender, hobbies, scent, budget } = body ?? {};

    if (!name && !gender && !hobbies && !scent) {
      return NextResponse.json(
        { error: "Please provide some recipient information so we can suggest gifts." },
        { status: 400 }
      );
    }

    const catalog = await getAllProducts();
    const catalogSummary = catalog
      .map((product) => {
        const tags = [
          product.bestSeller ? "best seller" : null,
          product.outstanding ? "outstanding" : null,
          product.limited ? "limited" : null,
        ]
          .filter(Boolean)
          .join(", ");

        return `- ${product.name} (id: ${product.id}, category: ${product.categoriesId}, price: ${product.price}${
          tags ? `, tags: ${tags}` : ""
        })\n  Description: ${product.description ?? "No description available."}`;
      })
      .join("\n");

    const userDetails = `
Recipient name: ${name || "Not provided"}
Birth date: ${birthDate || "Unknown"}
Gender: ${gender || "Unknown"}
Interests / occasion: ${hobbies || "Unknown"}
Favourite scent: ${scent || "Unknown"}
Budget: ${budget || "Not specified"}
`;

    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are Scenta's stylist and greeting-card copywriter.
Use only the provided catalog items.
For each recommendation return {"productName", "reason", "cardMessage"}.
"cardMessage" should be 2-3 heartfelt, elegant sentences with a personal touch.
Respond with plain JSON only (no explanations).`,
    };

    const userMessage: ChatMessage = {
      role: "user",
      content: `Scenta catalog:\n${catalogSummary}\n---\nRecipient information:\n${userDetails}\nPick up to 4 suitable products and reply strictly in JSON as requested.`,
    };

    const rawResponse = await callChatCompletion([systemMessage, userMessage], {
      temperature: 0.5,
      maxTokens: 1600,
    });

    const rawSuggestions = parseAiGiftResponse(rawResponse);
    if (!rawSuggestions) {
      return NextResponse.json({
        suggestions: [],
        raw: rawResponse,
        note: "AI returned data that is not valid JSON. See raw content for details.",
      });
    }

    const suggestions = rawSuggestions
      .map((item) => normalizeSuggestion(item, catalog))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (!suggestions.length) {
      return NextResponse.json({
        suggestions: [],
        raw: rawResponse,
        note: "No matching catalog product was found. Try again with different details.",
      });
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[AI Gift] error:", error);
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to connect to the AI service. Please try again later.",
      },
      { status: 500 }
    );
  }
}

function parseAiGiftResponse(raw: string): RawSuggestion[] | null {
  const tryParse = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const extractSuggestions = (data: unknown): RawSuggestion[] | null => {
    if (!data || typeof data !== "object") return null;
    if (Array.isArray(data)) return data as RawSuggestion[];
    const suggestions = (data as { suggestions?: unknown }).suggestions;
    return Array.isArray(suggestions) ? (suggestions as RawSuggestion[]) : null;
  };

  const direct = extractSuggestions(tryParse(raw.trim()));
  if (direct) {
    return direct;
  }

  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch) {
    const parsed = extractSuggestions(tryParse(codeBlockMatch[1].trim()));
    if (parsed) {
      return parsed;
    }
  }

  const braceMatch = raw.match(/(\{[\s\S]*\})/);
  if (braceMatch) {
    const parsed = extractSuggestions(tryParse(braceMatch[1]));
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function normalizeSuggestion(
  raw: RawSuggestion,
  catalog: Awaited<ReturnType<typeof getAllProducts>>
) {
  if (!raw?.productName || !raw.reason || !raw.cardMessage) {
    return null;
  }

  const normalizedName = raw.productName.trim().toLowerCase();
  const product =
    catalog.find((item) => item.name.toLowerCase() === normalizedName) ||
    catalog.find((item) => normalizedName.includes(item.name.toLowerCase())) ||
    catalog.find((item) => item.name.toLowerCase().includes(normalizedName));

  if (!product) {
    return null;
  }

  return {
    productName: product.name,
    reason: raw.reason,
    cardMessage: raw.cardMessage,
    product: {
      id: product.id,
      name: product.name,
      url: product.url,
      price: product.price,
      image: product.images?.[0] ?? null,
      description: product.description,
    },
  };
}
