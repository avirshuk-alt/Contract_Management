"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";
import {
  FileText,
  LayoutDashboard,
  GitCompare,
  Lightbulb,
  BarChart3,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const TILES = [
  { name: "Contracts Library", href: "/contracts", icon: FileText },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Comparison", href: "/compare", icon: GitCompare },
  { name: "Opportunities", href: "/opportunities", icon: Lightbulb },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
] as const;

const DEMO_EMAIL = "admin@example.com";
const DEMO_PASSWORD = "Admin123!";

export function HomeLauncher({ session }: { session: Session | null }) {
  const router = useRouter();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setIsLoading(false);
    if (result?.error) {
      setError("Invalid credentials. Please use admin@example.com / Admin123!");
      return;
    }
    setShowLoginForm(false);
    router.refresh();
  };

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Home</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a section to get started. Sign-in is optional (demo).
            </p>
          </div>
          {session?.user ? (
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="border-border"
            >
              Logout
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowLoginForm((v) => !v)}
              className="border-border"
            >
              {showLoginForm ? "Hide sign in" : "Sign in (demo)"}
            </Button>
          )}
        </div>

        {showLoginForm && !session?.user && (
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <form onSubmit={handleSignIn} className="space-y-4 max-w-sm">
                {error && (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={DEMO_EMAIL}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary border-border"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary border-border"
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TILES.map((tile) => (
            <Link key={tile.href} href={tile.href}>
              <Card className="h-full border-border bg-card transition-colors hover:bg-accent/50 hover:border-primary/30 cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <tile.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">
                    {tile.name}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
