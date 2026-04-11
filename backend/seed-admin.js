/**
 * Seed script to create the first admin account.
 *
 * Usage:
 *   node seed-admin.js <username> <password> <name>
 *
 * Example:
 *   node seed-admin.js admin mypassword "Site Admin"
 */

require("dotenv").config();

const bcrypt = require("bcrypt");
const prisma = require("./db");

async function main() {
  const [, , username, password, name] = process.argv;

  if (!username || !password || !name) {
    console.error("Usage: node seed-admin.js <username> <password> <name>");
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    console.error(`Admin with username "${username}" already exists.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: {
      username,
      passwordHash,
      name,
    },
  });

  console.log(`Admin created successfully:`);
  console.log(`  ID:       ${admin.id}`);
  console.log(`  Username: ${admin.username}`);
  console.log(`  Name:     ${admin.name}`);
}

main()
  .catch((err) => {
    console.error("Failed to seed admin:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
