import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

declare global {
  var __tcgLeaguePrisma__: PrismaClient | undefined;
}

export function getDb() {
  if (!global.__tcgLeaguePrisma__) {
    global.__tcgLeaguePrisma__ = createPrismaClient();
  }

  return global.__tcgLeaguePrisma__;
}

export function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}
