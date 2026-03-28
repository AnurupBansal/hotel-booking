const { Pool } = require("pg");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return databaseUrl;
  }

  const url = new URL(databaseUrl);

  if (!url.searchParams.has("pgbouncer")) {
    url.searchParams.set("pgbouncer", "true");
  }

  if (!url.searchParams.has("connection_limit")) {
    url.searchParams.set("connection_limit", "1");
  }

  return url.toString();
}

const globalForPrisma = globalThis;
const databaseUrl = getDatabaseUrl();
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
    adapter: new PrismaPg(
      new Pool({
        connectionString: databaseUrl,
      })
    ),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
