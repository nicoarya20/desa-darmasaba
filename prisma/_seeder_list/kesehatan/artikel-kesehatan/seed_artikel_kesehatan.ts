import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

const artikelJson = loadJsonData("kesehatan/artikel-kesehatan/artikel-kesehatan.json");
const introJson = loadJsonData("kesehatan/artikel-kesehatan/introduction.json");
const symptomJson = loadJsonData("kesehatan/artikel-kesehatan/symptom.json");
const preventionJson = loadJsonData("kesehatan/artikel-kesehatan/prevention.json");
const firstAidJson = loadJsonData("kesehatan/artikel-kesehatan/first-aid.json");
const mythVsFactJson = loadJsonData("kesehatan/artikel-kesehatan/myth-vs-fact.json");
const doctorSignJson = loadJsonData("kesehatan/artikel-kesehatan/doctor-sign.json");

export async function seedArtikelKesehatan() {
  console.log("Seeding Introduction...");
  for (const item of introJson) {
    await prisma.introduction.upsert({
      where: { id: item.id },
      update: { content: item.content },
      create: { id: item.id, content: item.content },
    });
  }

  console.log("Seeding Symptom...");
  for (const item of symptomJson) {
    await prisma.symptom.upsert({
      where: { id: item.id },
      update: { title: item.title, content: item.content },
      create: { id: item.id, title: item.title, content: item.content },
    });
  }

  console.log("Seeding Prevention...");
  for (const item of preventionJson) {
    await prisma.prevention.upsert({
      where: { id: item.id },
      update: { title: item.title, content: item.content },
      create: { id: item.id, title: item.title, content: item.content },
    });
  }

  console.log("Seeding First Aid...");
  for (const item of firstAidJson) {
    await prisma.firstAid.upsert({
      where: { id: item.id },
      update: { title: item.title, content: item.content },
      create: { id: item.id, title: item.title, content: item.content },
    });
  }

  console.log("Seeding Myth vs Fact...");
  for (const item of mythVsFactJson) {
    await prisma.mythVsFact.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        mitos: item.mitos,
        fakta: item.fakta,
      },
      create: {
        id: item.id,
        title: item.title,
        mitos: item.mitos,
        fakta: item.fakta,
      },
    });
  }

  console.log("Seeding Doctor Sign...");
  for (const item of doctorSignJson) {
    await prisma.doctorSign.upsert({
      where: { id: item.id },
      update: { content: item.content },
      create: { id: item.id, content: item.content },
    });
  }

  console.log("Seeding Artikel Kesehatan...");
  for (const item of artikelJson) {
    await prisma.artikelKesehatan.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        content: item.content,
        introductionId: item.introductionId,
        symptomId: item.symptomId,
        preventionId: item.preventionId,
        firstAidId: item.firstAidId,
        mythVsFactId: item.mythVsFactId,
        doctorSignId: item.doctorSignId,
      },
      create: {
        id: item.id,
        title: item.title,
        content: item.content,
        introductionId: item.introductionId,
        symptomId: item.symptomId,
        preventionId: item.preventionId,
        firstAidId: item.firstAidId,
        mythVsFactId: item.mythVsFactId,
        doctorSignId: item.doctorSignId,
      },
    });
    console.log(`  Artikel: ${item.title}`);
  }

  console.log("Artikel Kesehatan seed selesai");
}
