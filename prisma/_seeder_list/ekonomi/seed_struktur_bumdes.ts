import prisma from "@/lib/prisma";
import { loadJsonData } from "../../load-json";
import { loadRetiredSeed, retireSeedRows } from "../../retire-seed-rows";

interface PosisiOrganisasi {
  id: string;
  nama: string;
  deskripsi: string;
  hierarki: number;
  parentId: string | null;
}

interface PegawaiBumDes {
  id: string;
  namaLengkap: string;
  gelarAkademik: string;
  tanggalMasuk: string;
  email: string;
  telepon: string;
  alamat: string;
  posisiId: string;
  isActive: boolean;
}

const posisiOrganisasiBumDes = loadJsonData<PosisiOrganisasi[][]>("ekonomi/struktur-organisasi/posisi-organisasi-bumdes.json");
// Posisi = struktur jabatan generik BUMDes (tanpa nama orang). Data pengurus sengaja kosong:
// nama pengurus BUMDes asli diinput admin lewat CMS, bukan di-seed (sebelumnya terisi perangkat desa).
const pegawai = loadJsonData<PegawaiBumDes[]>("ekonomi/struktur-organisasi/pegawai-bumdes.json");
const pegawaiPensiun = loadRetiredSeed<{ id: string; namaLengkap: string }>(
  "ekonomi/struktur-organisasi/pegawai-bumdes.retired.json",
);
const posisiPensiun = loadRetiredSeed<{ id: string; nama: string }>(
  "ekonomi/struktur-organisasi/posisi-organisasi-bumdes.retired.json",
);

export async function seedStrukturBumdes() {
  const flattenedPosisi = posisiOrganisasiBumDes.flat();

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
    await prisma.posisiOrganisasiBumDes.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log("posisi organisasi berhasil");
  for (const p of pegawai) {
    await prisma.pegawaiBumDes.upsert({
      where: {
        id: p.id,
      },
      update: {
        namaLengkap: p.namaLengkap,
        gelarAkademik: p.gelarAkademik,
        tanggalMasuk: new Date(p.tanggalMasuk),
        email: p.email,
        telepon: p.telepon,
        alamat: p.alamat,
        posisiId: p.posisiId,
        isActive: p.isActive,
      },
      create: {
        id: p.id,
        namaLengkap: p.namaLengkap,
        gelarAkademik: p.gelarAkademik,
        tanggalMasuk: new Date(p.tanggalMasuk),
        email: p.email,
        telepon: p.telepon,
        alamat: p.alamat,
        posisiId: p.posisiId,
        isActive: p.isActive,
      },
    });
  }
  console.log("pegawai success ...");

  // Pegawai dulu: PegawaiBumDes.posisiId wajib (ON DELETE RESTRICT), posisi tak bisa dihapus selama masih dipakai.
  await retireSeedRows("Pegawai BUMDes", pegawaiPensiun, (p) =>
    prisma.pegawaiBumDes.deleteMany({ where: { id: p.id, namaLengkap: p.namaLengkap } }),
  );
  await retireSeedRows("Posisi BUMDes", posisiPensiun, (p) =>
    prisma.posisiOrganisasiBumDes.deleteMany({ where: { id: p.id, nama: p.nama } }),
  );
}
