import { AppShell } from "@/components/app-shell";

export default function SuppliersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
