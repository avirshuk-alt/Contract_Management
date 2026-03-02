import { NextRequest, NextResponse } from "next/server";
import { extractMetadata } from "@/lib/services/metadata-extraction";

const ALLOWED_MIME = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();
  return result.text ?? "";
}

/**
 * POST /api/extract/metadata
 * Extracts contract name, supplier, type, dates from a PDF or DOCX file.
 * PDF: full extraction. DOCX: returns filename-based suggestions only (no text extraction).
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
      return NextResponse.json({ error: "Only PDF and DOCX are supported" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name || "document";
    const isPdf = file.type === "application/pdf";

    let text = "";
    if (isPdf) {
      text = await extractTextFromPdf(buffer);
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json({
        contractName: filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
        supplierName: null,
        contractType: "MSA",
        effectiveDate: null,
        expiryDate: null,
      });
    }

    const metadata = await extractMetadata(text, filename);
    return NextResponse.json(metadata);
  } catch (err) {
    console.error("[POST /api/extract/metadata]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Extraction failed" },
      { status: 500 }
    );
  }
}
