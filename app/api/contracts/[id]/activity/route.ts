import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActivityForContract } from "@/lib/services/contract-service";
import { toApiAction } from "@/lib/api-mappers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const events = await getActivityForContract(id);

  const activities = events.map((e) => ({
    id: e.id,
    contractId: e.contractId,
    action: toApiAction(e.action),
    timestamp: e.createdAt.toISOString(),
    details: e.details,
  }));

  return NextResponse.json(activities);
}
