import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const jenjangPendidikan = loadJsonData("pendidikan/info-sekolah/jenjang-pendidikan.json");
const lembagaPendidikan = loadJsonData("pendidikan/info-sekolah/lembaga.json");
const siswa = loadJsonData("pendidikan/info-sekolah/siswa.json");
const pengajar = loadJsonData("pendidikan/info-sekolah/pengajar.json");

export async function seedInfoSekolah() {
  for (const j of jenjangPendidikan) {
    await prisma.jenjangPendidikan.upsert({
      where: {
        id: j.id,
      },
      update: {
        nama: j.nama,
      },
      create: {
        id: j.id,
        nama: j.nama,
      },
    });
  }
  console.log("✅ Jenjang Pendidikan seeded successfully");
  for (const j of lembagaPendidikan) {
    await prisma.lembaga.upsert({
      where: {
        id: j.id,
      },
      update: {
        nama: j.nama,
        jenjangId: j.jenjangId,
      },
      create: {
        id: j.id,
        nama: j.nama,
        jenjangId: j.jenjangId,
      },
    });
  }
  console.log("✅ Lembaga Pendidikan seeded successfully");
  for (const j of siswa) {
    await prisma.siswa.upsert({
      where: {
        id: j.id,
      },
      update: {
        nama: j.nama,
        lembagaId: j.lembagaId,
      },
      create: {
        id: j.id,
        nama: j.nama,
        lembagaId: j.lembagaId,
      },
    });
  }
  console.log("✅ siswa seeded successfully");
  for (const j of pengajar) {
    await prisma.pengajar.upsert({
      where: {
        id: j.id,
      },
      update: {
        nama: j.nama,
        lembagaId: j.lembagaId,
      },
      create: {
        id: j.id,
        nama: j.nama,
        lembagaId: j.lembagaId,
      },
    });
  }
  console.log("✅ pengajar seeded successfully");
}
