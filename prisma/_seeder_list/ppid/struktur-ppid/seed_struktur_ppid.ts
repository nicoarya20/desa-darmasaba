import prisma from "@/lib/prisma";
import { loadJsonData } from "../../../load-json";

interface PegawaiPPID {
  id: string;
  namaLengkap: string;
  gelarAkademik: string;
  tanggalMasuk: string;
  email: string;
  telepon: string;
  alamat: string;
  imageName?: string;
  posisiId: string;
  isActive: boolean;
}

interface PosisiOrganisasiPPID {
  id: string;
  nama: string;
  deskripsi: string;
  hierarki: number;
  parentId: string | null;
}

const pegawaiPpid = loadJsonData<PegawaiPPID[]>("ppid/struktur-ppid/pegawai-PPID.json");
const posisiOrganisasiPPID = loadJsonData<PosisiOrganisasiPPID[][]>("ppid/struktur-ppid/posisi-organisasi-PPID.json");

export async function seedPegawaiPpid() {

const flattenedPosisi = posisiOrganisasiPPID.flat();

  // ✅ Urutkan berdasarkan hierarki
  const sortedPosisi = flattenedPosisi.sort((a, b) => a.hierarki - b.hierarki);

  for (const p of sortedPosisi) {
    console.log(`Seeding: ${p.nama} (id: ${p.id}, parent: ${p.parentId})`);

    if (p.parentId) {
      const parentExists = flattenedPosisi.some((pos) => pos.id === p.parentId);
      if (!parentExists) {
        console.warn(
          `⚠️ Parent tidak ditemukan: ${p.parentId} untuk ${p.nama}`,
        );
        continue;
      }
    }

    await prisma.posisiOrganisasiPPID.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log("posisi organisasi berhasil");

  console.log("🔄 Seeding Struktur Ppid...");
  for (const m of pegawaiPpid) {
    let imageId: string | null = null;

    if (m.imageName) {
      const image = await prisma.fileStorage.findUnique({
        where: { name: m.imageName },
        select: { id: true },
      });

      if (!image) {
        console.warn(
          `⚠️ Image not found for pegawai ppid "${m.namaLengkap}": ${m.imageName}`,
        );
      } else {
        imageId = image.id;
      }
    }

    await prisma.pegawaiPPID.upsert({
      where: { id: m.id },
      update: {
        namaLengkap: m.namaLengkap,
        gelarAkademik: m.gelarAkademik,
        tanggalMasuk: m.tanggalMasuk,
        email: m.email,
        telepon: m.telepon,
        alamat: m.alamat,
        imageId,
        posisiId: m.posisiId,
        isActive: m.isActive,
      },
      create: {
        id: m.id,
        namaLengkap: m.namaLengkap,
        gelarAkademik: m.gelarAkademik,
        tanggalMasuk: m.tanggalMasuk,
        email: m.email,
        telepon: m.telepon,
        alamat: m.alamat,
        imageId,
        posisiId: m.posisiId,
        isActive: m.isActive,
      },
    });
  }

  console.log("struktur ppid success ...");
}
  