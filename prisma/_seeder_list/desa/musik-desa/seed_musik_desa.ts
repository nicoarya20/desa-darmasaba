import prisma from "../../../seed-prisma";
import { loadJsonData } from "../../../load-json";

const musikJson = loadJsonData("desa/musik-desa/musik-desa.json");

export async function seedMusikDesa() {
  console.log("Seeding Musik Desa...");

  for (const item of musikJson) {
    let audioFileId: string | null = null;
    let coverImageId: string | null = null;

    if (item.audioFileName) {
      const audio = await prisma.fileStorage.findUnique({
        where: { name: item.audioFileName },
        select: { id: true },
      });
      if (audio) audioFileId = audio.id;
    }

    if (item.coverImageName) {
      const cover = await prisma.fileStorage.findUnique({
        where: { name: item.coverImageName },
        select: { id: true },
      });
      if (cover) coverImageId = cover.id;
    }

    await prisma.musikDesa.upsert({
      where: { id: item.id },
      update: {
        judul: item.judul,
        artis: item.artis,
        deskripsi: item.deskripsi,
        durasi: item.durasi,
        audioFileId,
        coverImageId,
        genre: item.genre,
        tahunRilis: item.tahunRilis,
      },
      create: {
        id: item.id,
        judul: item.judul,
        artis: item.artis,
        deskripsi: item.deskripsi,
        durasi: item.durasi,
        audioFileId,
        coverImageId,
        genre: item.genre,
        tahunRilis: item.tahunRilis,
      },
    });
    console.log(`  Musik: ${item.judul} - ${item.artis}`);
  }

  console.log("Musik Desa seed selesai");
}
