import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { HomeLauncher } from "@/components/home-launcher";

export default async function HomePage() {
  const session = await auth();

  return (
    <AppShell>
      <HomeLauncher session={session} />
    </AppShell>
  );
}
