import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Shared Prisma client. Throws if DATABASE_URL is not configured. */
export function getDb(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const client = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: 3,
      connectionTimeoutMillis: 5000,
    }),
  });

  globalForPrisma.prisma = client;
  return client;
}
