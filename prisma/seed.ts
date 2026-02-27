import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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

  console.log("Created admin user:", admin.email);

  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { id: "seed-supplier-1" },
      update: {},
      create: {
        id: "seed-supplier-1",
        name: "Disco Hi-Tec America Inc.",
        industry: "Capital Equipment Services",
        spendEstimate: 1500000,
        riskTrend: "stable",
        primaryContact: "Shinji Ueno",
        email: "shinji@discousa.com",
        location: "Santa Clara, CA",
      },
    }),
    prisma.supplier.upsert({
      where: { id: "seed-supplier-2" },
      update: {},
      create: {
        id: "seed-supplier-2",
        name: "W.W. Grainger, Inc.",
        industry: "MRO Supply & Distribution",
        spendEstimate: 23917000,
        riskTrend: "stable",
        primaryContact: "Penelope Jones",
        email: "penelope.jones@grainger.com",
        location: "Lake Forest, IL",
      },
    }),
    prisma.supplier.upsert({
      where: { id: "seed-supplier-3" },
      update: {},
      create: {
        id: "seed-supplier-3",
        name: "NuSource",
        industry: "Industrial Supply",
        spendEstimate: 4500000,
        riskTrend: "improving",
        primaryContact: "Project Manager",
        email: "gehc.support@nusource.com",
        location: "Phoenix, AZ",
      },
    }),
  ]);

  const contracts = await Promise.all([
    prisma.contract.create({
      data: {
        supplierId: suppliers[0].id,
        contractName: "Capital Equipment Services Extension Agreement",
        contractType: "Amendment",
        effectiveDate: new Date("2025-09-25"),
        expiryDate: new Date("2027-03-01"),
        status: "active",
        riskScore: 28,
        riskLevel: "low",
        value: 1500000,
      },
    }),
    prisma.contract.create({
      data: {
        supplierId: suppliers[1].id,
        contractName: "MRO Materials Supply Agreement",
        contractType: "MSA",
        effectiveDate: new Date("2022-11-17"),
        expiryDate: new Date("2026-03-31"),
        status: "expiring",
        riskScore: 42,
        riskLevel: "medium",
        value: 23917000,
      },
    }),
    prisma.contract.create({
      data: {
        supplierId: suppliers[2].id,
        contractName: "Supply Agreement (Goods and/or Services)",
        contractType: "MSA",
        effectiveDate: new Date("2023-03-09"),
        expiryDate: new Date("2028-03-09"),
        status: "active",
        riskScore: 32,
        riskLevel: "low",
        value: 4500000,
      },
    }),
  ]);

  for (const contract of contracts) {
    await prisma.activityEvent.create({
      data: {
        contractId: contract.id,
        userId: admin.id,
        action: "uploaded",
        details: `${contract.contractName} - seed data`,
      },
    });
  }

  console.log(`Created ${suppliers.length} suppliers, ${contracts.length} contracts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
