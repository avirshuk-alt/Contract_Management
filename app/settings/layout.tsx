import { AppShell } from "@/components/app-shell"
import type { ReactNode } from "react"

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
