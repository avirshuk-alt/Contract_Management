"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type SessionUser = { name?: string | null; email?: string | null } | null;

export function HomeAuthActions({ session }: { session: SessionUser }) {
  if (session?.email ?? session?.name) {
    return (
      <Button
        variant="outline"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="border-border"
      >
        Sign out
      </Button>
    );
  }
  return (
    <Button asChild>
      <Link href="/auth/signin?callbackUrl=/">Log in</Link>
    </Button>
  );
}
