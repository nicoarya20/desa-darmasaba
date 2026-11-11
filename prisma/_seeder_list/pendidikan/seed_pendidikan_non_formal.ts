import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const tujuanProgram = loadJsonData("pendidikan/pendidikan-non-formal/tujuan-program2.json");
const tempatKegiatan = loadJsonData("pendidikan/pendidikan-non-formal/tempat-kegiatan.json");
const jenisProgramYangDiselenggarakan = loadJsonData("pendidikan/pendidikan-non-formal/jenis-program-yang-diselenggarakan.json");

export async function seedPendidikanNonFormal() {
  for (const t of tujuanProgram) {
    await prisma.tujuanPendidikanNonFormal.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log(
    "✅ fasilitas bimbingan belajar desa seeded (editable later via UI)",
  );

  for (const t of tempatKegiatan) {
    await prisma.tempatKegiatan.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log(
    "✅ fasilitas bimbingan belajar desa seeded (editable later via UI)",
  );

  for (const t of jenisProgramYangDiselenggarakan) {
    await prisma.jenisProgramYangDiselenggarakan.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log(
    "✅ fasilitas bimbingan belajar desa seeded (editable later via UI)",
  );   
}