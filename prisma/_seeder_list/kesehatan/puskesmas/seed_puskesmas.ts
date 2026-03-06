import prisma from "@/lib/prisma";
import puskesmasJson from "../../../data/kesehatan/puskesmas/puskesmas.json";
import kontakPuskesmasJson from "../../../data/kesehatan/puskesmas/kontak-puskesmas/kontak.json";
import jamPuskesmasJson from "../../../data/kesehatan/puskesmas/jam-puskesmas/jam.json";

export async function seedPuskesmas() {
  console.log("🔄 Seeding Kontak Puskesmas...");
  for (const k of kontakPuskesmasJson) {
    await prisma.kontakPuskesmas.upsert({
      where: {
        id: k.id,
      },
      update: {
        kontakPuskesmas: k.kontakPuskesmas,
        email: k.email,
        facebook: k.facebook,
        kontakUGD: k.kontakUGD,
      },
      create: {
        id: k.id,
        kontakPuskesmas: k.kontakPuskesmas,
        email: k.email,
        facebook: k.facebook,
        kontakUGD: k.kontakUGD,
      },
    });
  }
  console.log("kontak puskesmas success ...");

  console.log("🔄 Seeding Jam Puskesmas...");
  for (const k of jamPuskesmasJson) {
    await prisma.jamOperasional.upsert({
      where: {
        id: k.id,
      },
      update: {
        workDays: k.workDays,
        weekDays: k.weekDays,
        holiday: k.holiday,
      },
      create: {
        id: k.id,
        workDays: k.workDays,
        weekDays: k.weekDays,
        holiday: k.holiday,
      },
    });
  }
  console.log("jam puskesmas success ...");

  console.log("🔄 Seeding Puskesmas...");

  for (const p of puskesmasJson) {
    let imageId: string | null = null;

    if (p.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: p.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for puskesmas "${p.name}": ${p.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.puskesmas.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        alamat: p.alamat,
        jamId: p.jamId,
        kontakId: p.kontakId,
        imageId,
      },
      create: {
        id: p.id,
        name: p.name,
        alamat: p.alamat,
        jamId: p.jamId,
        kontakId: p.kontakId,
        imageId,
      },
    });

    console.log(`✅ Puskesmas seeded: ${p.name}`);
  }

  console.log("🎉 Puskesmas seed selesai");
}

