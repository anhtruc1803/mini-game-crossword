/**
 * Prisma seed script.
 * Creates optional admin credentials and idempotent demo data.
 *
 * Usage:
 *   SEED_ADMIN_EMAIL=admin@example.com
 *   SEED_ADMIN_PASSWORD=strong-password
 *   npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function readSeedValue(name: "SEED_ADMIN_EMAIL" | "SEED_ADMIN_PASSWORD") {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

async function seedAdminUser() {
  const email = readSeedValue("SEED_ADMIN_EMAIL")?.toLowerCase();
  const password = readSeedValue("SEED_ADMIN_PASSWORD");

  if (!email || !password) {
    console.log(
      "Skipping admin user seed. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "admin",
      isActive: true,
    },
    create: {
      email,
      username: "admin",
      passwordHash,
      fullName: "Admin User",
      role: "admin",
      isActive: true,
    },
  });

  console.log(`Admin user seeded: ${email}`);
}

async function seedDemoData() {
  let theme = await prisma.theme.findFirst({
    where: { name: "Default Theme" },
  });

  if (!theme) {
    theme = await prisma.theme.create({
      data: {
        name: "Default Theme",
        primaryColor: "#6366f1",
        secondaryColor: "#8b5cf6",
        accentColor: "#f59e0b",
        overlayOpacity: 0.5,
      },
    });
  }

  const program = await prisma.program.upsert({
    where: { slug: "demo-crossword" },
    update: {
      title: "Demo O Chu",
      description: "Chuong trinh demo o chu",
      status: "draft",
      themeId: theme.id,
    },
    create: {
      slug: "demo-crossword",
      title: "Demo O Chu",
      description: "Chuong trinh demo o chu",
      status: "draft",
      themeId: theme.id,
    },
  });

  let game = await prisma.game.findFirst({
    where: { programId: program.id },
    orderBy: { createdAt: "desc" },
  });

  if (!game) {
    game = await prisma.game.create({
      data: {
        programId: program.id,
        title: "O Chu Cong Nghe",
        finalKeyword: "CODING",
        totalRows: 6,
      },
    });
  }

  const existingRows = await prisma.crosswordRow.count({
    where: { gameId: game.id },
  });

  if (existingRows > 0) {
    console.log("Demo rows already exist. Skipping row seed.");
    return;
  }

  const rows = [
    {
      clue: "Ngon ngu lap trinh pho bien nhat cho web frontend?",
      answer: "JAVASCRIPT",
      highlight: [2],
    },
    {
      clue: "He quan tri co so du lieu quan he pho bien?",
      answer: "MYSQL",
      highlight: [0],
    },
    {
      clue: "Framework React pho bien cho full-stack?",
      answer: "NEXTJS",
      highlight: [0],
    },
    {
      clue: "Ngon ngu danh dau sieu van ban?",
      answer: "HTML",
      highlight: [2],
    },
    {
      clue: "Cong cu quan ly phien ban ma nguon?",
      answer: "GIT",
      highlight: [1],
    },
    {
      clue: "Nen tang runtime cho JavaScript phia server?",
      answer: "NODEJS",
      highlight: [2],
    },
  ];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    await prisma.crosswordRow.create({
      data: {
        gameId: game.id,
        rowOrder: index,
        clueText: row.clue,
        answerText: row.answer,
        answerLength: row.answer.length,
        highlightedIndexesJson: JSON.stringify(row.highlight),
        rowStatus: "hidden",
      },
    });
  }

  console.log("Demo data seeded successfully.");
}

async function main() {
  await seedAdminUser();
  await seedDemoData();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
