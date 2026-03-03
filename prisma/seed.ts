import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  // Delete all contract-related data (order respects FKs)
  await prisma.clause.deleteMany({});
  await prisma.obligation.deleteMany({});
  await prisma.contractVersion.deleteMany({});
  await prisma.contractDocument.deleteMany({});
  await prisma.activityEvent.deleteMany({});
  await prisma.contract.deleteMany({});
  await prisma.supplier.deleteMany({});

  // Clear uploaded files (local uploads folder)
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (fs.existsSync(uploadsDir)) {
    const entries = fs.readdirSync(uploadsDir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(uploadsDir, e.name);
      if (e.isDirectory()) fs.rmSync(full, { recursive: true });
      else fs.unlinkSync(full);
    }
    console.log("Cleared uploads folder.");
  }

  const passwordHash = await hash("Admin123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash, role: "Admin" },
    create: {
      email: "admin@example.com",
      name: "Admin User",
      passwordHash,
      role: "Admin",
    },
  });

  console.log("Fresh start: DB cleared, admin user ready:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
