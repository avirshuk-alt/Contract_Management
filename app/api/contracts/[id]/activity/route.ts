import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getActivityForContract } from "@/lib/services/contract-service";
import { toApiAction } from "@/lib/api-mappers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await auth();
  // Sign-in is optional; allow unauthenticated access for demo

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
