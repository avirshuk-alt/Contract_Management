/**
 * Map Prisma enums to frontend-friendly strings (e.g. under_review -> under-review)
 */

export function toApiStatus(s: string): string {
  return s === "under_review" ? "under-review" : s;
}

export function toApiAction(a: string): string {
  return a.replace(/_/g, "-");
}

export function fromApiStatus(s: string): string {
  return s === "under-review" ? "under_review" : s;
}
