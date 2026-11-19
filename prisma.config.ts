
import { defineConfig } from "prisma/config";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Optional locally; hosted environments inject variables directly.
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Check your .env.local or .env file.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
