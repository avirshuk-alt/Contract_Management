"use client";

import { AppSidebar } from "./app-sidebar";
import { TopNav } from "./top-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto">
          {children}
          {/* Footer disclaimer */}
          <footer className="border-t border-border bg-card/50 px-6 py-3">
            <p className="text-center text-xs text-muted-foreground">
              Demo environment. Insights are AI-generated and require human review.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
