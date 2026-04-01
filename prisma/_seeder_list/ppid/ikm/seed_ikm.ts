import prisma from "@/lib/prisma";
import jenisKelamin from "../../../data/ppid/ikm/jenis-kelamin/jenis-kelamin.json";
import pilihanRatingResponden from "../../../data/ppid/ikm/pilihan-rating-responden/rating-responden.json";
import umurResponden from "../../../data/ppid/ikm/umur-responden/umur-responden.json";

export async function seedIkmPpid() {
 for (const j of jenisKelamin) {
    await prisma.jenisKelaminResponden.upsert({
      where: {
        id: j.id,
      },
      update: {
        name: j.name,
      },
      create: {
        id: j.id,
        name: j.name,
      },
    });
  }
  console.log("jenis kelamin responden success ...");

  for (const r of pilihanRatingResponden) {
    await prisma.pilihanRatingResponden.upsert({
      where: {
        id: r.id,
      },
      update: {
        name: r.name,
      },
      create: {
        id: r.id,
        name: r.name,
      },
    });
  }
  console.log("pilihan rating responden success ...");

  for (const u of umurResponden) {
    await prisma.umurResponden.upsert({
      where: {
        id: u.id,
      },
      update: {
        name: u.name,
      },
      create: {
        id: u.id,
        name: u.name,
      },
    });
  }
  console.log("umur responden success ...");   
}