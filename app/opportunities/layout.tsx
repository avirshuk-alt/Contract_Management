import { AppShell } from "@/components/app-shell";

export default function OpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
