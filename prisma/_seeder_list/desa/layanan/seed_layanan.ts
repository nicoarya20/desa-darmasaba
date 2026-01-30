import prisma from "@/lib/prisma";
import pelayananSuratKeterangan from "../../../data/desa/layanan/pelayananSuratKeterangan.json";
import pelayananTelunjukSaktiDesa from "../../../data/desa/layanan/pelayananTelunjukSaktiDesa.json";
import pelayananPerizinanBerusaha from "../../../data/desa/layanan/pelayananPerizinanBerusaha.json";
import pelayananPendudukNonPermanen from "../../../data/desa/layanan/pelayananPendudukNonPermanen.json";

export async function seedLayanan() {
  console.log("🔄 Seeding Pelayanan Surat Keterangan...");

  for (const p of pelayananSuratKeterangan) {
    const existing = await prisma.pelayananSuratKeterangan.findUnique({
      where: { id: p.id },
      select: { imageId: true, image2Id: true }, // 📌 tambahkan image2Id
    });

    // 1️⃣ Handle imageId
    let imageId = existing?.imageId ?? null;

    if (p.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: p.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for pelayanan surat keterangan 1 "${p.name}": ${p.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    // 2️⃣ Handle image2Id
    let image2Id = existing?.image2Id ?? null;

    if (p.image2Name) {
      const image2 = await prisma.fileStorage.findUnique({
        where: { name: p.image2Name },
        select: { id: true },
      });

      if (!image2) {
        console.warn(
          `⚠️ Image not found for pelayanan surat keterangan 2 "${p.name}": ${p.image2Name}`,
        );
      } else {
        image2Id = image2.id;
      }
    }

    // 3️⃣ Upsert dengan kedua image
    await prisma.pelayananSuratKeterangan.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        deskripsi: p.deskripsi,
        imageId,
        image2Id, // 📌 tambahkan ini
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsi: p.deskripsi,
        imageId,
        image2Id, // 📌 tambahkan ini
      },
    });
  }
  console.log("✅ Pelayanan Surat Keterangan success...");

  for (const p of pelayananTelunjukSaktiDesa) {
    await prisma.pelayananTelunjukSaktiDesa.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        deskripsi: p.deskripsi,
        link: p.link,
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsi: p.deskripsi,
        link: p.link,
      },
    });
  }
  console.log("pelayanan telunjuk sakti desa success ...");

  for (const l of pelayananPerizinanBerusaha) {
    await prisma.pelayananPerizinanBerusaha.upsert({
      where: {
        id: l.id,
      },
      update: {
        name: l.name,
        deskripsi: l.deskripsi,
        link: l.link,
      },
      create: {
        id: l.id,
        name: l.name,
        deskripsi: l.deskripsi,
        link: l.link,
      },
    });
  }

  console.log("pelayanan perizinan berusaha success ...");

  for (const l of pelayananPendudukNonPermanen) {
    await prisma.pelayananPendudukNonPermanen.upsert({
      where: {
        id: l.id,
      },
      update: {
        name: l.name,
        deskripsi: l.deskripsi,
      },
      create: {
        id: l.id,
        name: l.name,
        deskripsi: l.deskripsi,
      },
    });
  }
  console.log("pelayanan penduduk non permanen success ...");
}
