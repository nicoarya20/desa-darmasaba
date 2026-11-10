import prisma from "../../seed-prisma";
import { PROFIL_BUMDES_ID } from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/profil/validation";
import { loadJsonData } from "../../load-json";

interface ProfilBumDesSeed {
  nama: string;
  deskripsi: string;
  alamat: string | null;
  kontak: string | null;
  tahunBerdiri: number | null;
}

interface UnitUsahaBumDesSeed {
  id: string;
  nama: string;
  deskripsi: string;
  urutan: number;
}

// Teks diturunkan dari seed Potensi (Bumdes Pudak Mesari, TPS3R Pudak Mesari). Kontak dan tahun berdiri sengaja kosong:
// tidak ada data resmi di repo, isi lewat admin.
const profil = loadJsonData<ProfilBumDesSeed>("ekonomi/bumdes/profil-bumdes.json");
const unitUsaha = loadJsonData<UnitUsahaBumDesSeed[]>("ekonomi/bumdes/unit-usaha-bumdes.json");

/** Seed profil BUMDes (singleton) dan daftar unit usaha (idempoten, upsert by id tetap). */
export async function seedBumdesProfil() {
  console.log("🔄 Seeding Profil BUMDes...");
  await prisma.profilBumDes.upsert({
    where: { id: PROFIL_BUMDES_ID },
    update: profil,
    create: { id: PROFIL_BUMDES_ID, ...profil },
  });

  for (const u of unitUsaha) {
    await prisma.unitUsahaBumDes.upsert({
      where: { id: u.id },
      update: { nama: u.nama, deskripsi: u.deskripsi, urutan: u.urutan },
      create: u,
    });
    console.log(`  ✅ Unit usaha BUMDes: ${u.nama}`);
  }
  console.log("🎉 Profil BUMDes seed selesai");
}
