import prisma from "../../seed-prisma";
import { readFileSync } from "fs";
import { join } from "path";

const keunggulanJson = JSON.parse(
  readFileSync(
    join(process.cwd(), "prisma/data/pendidikan/keunggulan-program/keunggulan-program.json"),
    "utf-8"
  )
);

export async function seedKeunggulanProgram() {
  console.log("Seeding Keunggulan Program...");

  for (const item of keunggulanJson) {
    await prisma.keunggulanProgram.upsert({
      where: { id: item.id },
      update: {
        judul: item.judul,
        deskripsi: item.deskripsi,
      },
      create: {
        id: item.id,
        judul: item.judul,
        deskripsi: item.deskripsi,
      },
    });
    console.log(`  Keunggulan: ${item.judul}`);
  }

  console.log("Keunggulan Program seed selesai");
}
