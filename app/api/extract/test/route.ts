import { NextRequest, NextResponse } from "next/server";
import { hasLlmExtractionConfigured } from "@/lib/services/llm-extraction";
import OpenAI from "openai";

/**
 * GET /api/extract/test
 * Validates that OPENAI_API_KEY is set and optionally tests it with a minimal LLM call.
 * Query param: ?ping=1 to make a real API call (uses a small number of tokens).
 */
export async function GET(req: NextRequest) {
  const configured = hasLlmExtractionConfigured();
  if (!configured) {
    return NextResponse.json(
      {
        ok: false,
        message: "OPENAI_API_KEY is not set. Add it to .env to enable LLM extraction.",
      },
      { status: 503 }
    );
  }

  const ping = req.nextUrl.searchParams.get("ping") === "1";
  if (!ping) {
    return NextResponse.json({
      ok: true,
      message: "OPENAI_API_KEY is set. Use ?ping=1 to verify the key works.",
    });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Reply with exactly: OK" }],
      max_tokens: 5,
    });
    const text = response.choices[0]?.message?.content?.trim();
    if (text === "OK") {
      return NextResponse.json({
        ok: true,
        message: "API key validated successfully.",
      });
    }
    return NextResponse.json(
      { ok: false, message: "Unexpected response from LLM." },
      { status: 502 }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "API key validation failed. Check that the key is valid and has access.",
      },
      { status: 502 }
    );
  }
}
