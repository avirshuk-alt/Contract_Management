import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runMROExtractionStub } from "@/lib/services/mro-extraction";

/**
 * Stub extraction endpoint. Populates contract.extraction with schema shape but null values.
 * No LLM integration yet. POST to trigger stub run and return the new payload.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await auth();
  const { id } = await params;
  try {
    const payload = await runMROExtractionStub(id);
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Extraction failed" },
      { status: 500 }
    );
  }
}
