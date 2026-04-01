import prisma from "@/lib/prisma";
import tujuanProgram from "../../data/pendidikan/pendidikan-non-formal/tujuan-program2.json";
import tempatKegiatan from "../../data/pendidikan/pendidikan-non-formal/tempat-kegiatan.json";
import jenisProgramYangDiselenggarakan from "../../data/pendidikan/pendidikan-non-formal/jenis-program-yang-diselenggarakan.json";

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