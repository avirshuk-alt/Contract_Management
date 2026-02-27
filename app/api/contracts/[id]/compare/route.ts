import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { diffLines, type Change } from "diff";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: contractId } = await params;
  const { searchParams } = new URL(req.url);
  const baseVersionId = searchParams.get("baseVersion");
  const otherVersionId = searchParams.get("otherVersion");
  const otherContractId = searchParams.get("otherContract");

  if (!baseVersionId || (!otherVersionId && !otherContractId)) {
    return NextResponse.json(
      { error: "Provide baseVersion and either otherVersion or otherContract" },
      { status: 400 }
    );
  }

  const getVersionText = async (versionId: string) => {
    const v = await prisma.contractVersion.findUnique({
      where: { id: versionId },
      include: { document: { include: { contract: true } } },
    });
    return v?.extractedText ?? "";
  };

  let baseText = await getVersionText(baseVersionId);
  let otherText = "";

  if (otherVersionId) {
    otherText = await getVersionText(otherVersionId);
  } else if (otherContractId) {
    const otherDoc = await prisma.contractDocument.findFirst({
      where: { contractId: otherContractId },
      include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
    });
    const otherVersion = otherDoc?.versions[0];
    if (otherVersion) {
      otherText = otherVersion.extractedText ?? "";
    }
  }

  const changes = diffLines(baseText, otherText);
  const unified = formatUnifiedDiff(changes);

  return NextResponse.json({
    baseVersionId,
    otherVersionId: otherVersionId ?? null,
    otherContractId: otherContractId ?? null,
    diff: unified,
    changes: changes.map((c) => ({
      added: c.added,
      removed: c.removed,
      value: c.value,
      count: c.count,
    })),
  });
}

function formatUnifiedDiff(changes: Change[]): string {
  const lines: string[] = [];
  for (const change of changes) {
    const prefix = change.added ? "+" : change.removed ? "-" : " ";
    const parts = change.value.split("\n").filter((l, i, arr) => i < arr.length - 1 || l);
    for (const line of parts) {
      lines.push(prefix + line);
    }
  }
  return lines.join("\n");
}
