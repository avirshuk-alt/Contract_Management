"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HARDCODED_EMAIL = "admin@example.com";
const HARDCODED_PASSWORD = "Admin123!";

export function HomeGuestView() {
  const router = useRouter();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

    router.push("/");
    router.refresh();
  };

  const handleReturnToHome = () => {
    setShowLoginForm(false);
    setError("");
    setEmail("");
    setPassword("");
  };

  if (showLoginForm) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Sign in</CardTitle>
            <CardDescription className="text-muted-foreground">
              Use the single demo account to access the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={handleReturnToHome}
            >
              ← Return to Home
            </Button>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary border-border"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-secondary border-border"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <p className="text-center text-xs text-muted-foreground">
              Demo: {HARDCODED_EMAIL} / {HARDCODED_PASSWORD}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            Contract Analysis Tool
          </h1>
          <p className="text-muted-foreground">
            Sign in to access the Contract Analysis tool.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 text-left">
          <h2 className="text-lg font-medium text-foreground mb-3">
            What is this tool?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ContractAI is an AI-powered contract understanding and management
            application for enterprise supplier contracts. Upload PDF or DOCX
            contracts, view them in a central library, track status and risk,
            and use AI-assisted extraction for clauses and obligations. You can
            manage suppliers, compare contract versions, and review activity
            timelines—all in one place.
          </p>
        </div>
        <Button onClick={() => setShowLoginForm(true)}>
          Log in
        </Button>
      </div>
    </div>
  );
}
