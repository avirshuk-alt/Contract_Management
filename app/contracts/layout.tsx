import { AppShell } from "@/components/app-shell";

export default function ContractsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
