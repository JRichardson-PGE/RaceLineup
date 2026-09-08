import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`Admin user ${username} already exists, skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { username, name, passwordHash, role: "ADMIN" },
  });

  console.log(`Created admin user: ${username} / ${password}`);
  console.log("Sign in and create your own account, then consider removing this one.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
