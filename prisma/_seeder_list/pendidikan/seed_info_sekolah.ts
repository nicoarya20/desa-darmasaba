import prisma from "@/lib/prisma";
import jenjangPendidikan from "../../data/pendidikan/info-sekolah/jenjang-pendidikan.json";
import lembagaPendidikan from "../../data/pendidikan/info-sekolah/lembaga.json";
import siswa from "../../data/pendidikan/info-sekolah/siswa.json";
import pengajar from "../../data/pendidikan/info-sekolah/pengajar.json";

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
