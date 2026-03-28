import "dotenv/config";
import { defineConfig, env } from "prisma/config";

function getDatabaseUrl() {
  const databaseUrl = env("DATABASE_URL");
  const url = new URL(databaseUrl);

  if (!url.searchParams.has("pgbouncer")) {
    url.searchParams.set("pgbouncer", "true");
  }

  if (!url.searchParams.has("connection_limit")) {
    url.searchParams.set("connection_limit", "1");
  }

  return url.toString();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: getDatabaseUrl(),
  },
});
