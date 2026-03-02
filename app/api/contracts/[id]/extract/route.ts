import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runMROExtraction } from "@/lib/services/mro-extraction";

/**
 * Extraction endpoint. Runs MRO extraction (LLM when API key is set, otherwise stub).
 * POST to trigger extraction and return the payload.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await auth();
  const { id } = await params;
  try {
    const payload = await runMROExtraction(id);
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Extraction failed" },
      { status: 500 }
    );
  }
}
