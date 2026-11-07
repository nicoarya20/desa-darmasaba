import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const tujuanBimbinganBelajarDesa = loadJsonData("pendidikan/bimbingan-belajar-desa/tujuan-bimbingan-belajar-desa.json");
const lokasiJadwalBimbinganBelajarDesa = loadJsonData("pendidikan/bimbingan-belajar-desa/lokasi-dan-jadwal.json");
const fasilitasBimbinganBelajarDesa = loadJsonData("pendidikan/bimbingan-belajar-desa/fasilitas-yang-disediakan.json");

export async function seedBimbinganBelajar() {
for (const t of tujuanBimbinganBelajarDesa) {
    await prisma.tujuanBimbinganBelajarDesa.upsert({
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
    "✅ tujuan bimbingan belajar desa seeded (editable later via UI)",
  );

  for (const t of lokasiJadwalBimbinganBelajarDesa) {
    await prisma.lokasiJadwalBimbinganBelajarDesa.upsert({
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
    "✅ lokasi jadwal bimbingan belajar desa seeded (editable later via UI)",
  );

  for (const t of fasilitasBimbinganBelajarDesa) {
    await prisma.fasilitasBimbinganBelajarDesa.upsert({
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