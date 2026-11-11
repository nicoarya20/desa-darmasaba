import prisma from "../../seed-prisma";
import { WILAYAH_DESA_ID } from "@/lib/wilayah-desa";
import { loadJsonData } from "../../load-json";

interface WilayahDesaSeed {
  batasUtara: string | null;
  batasSelatan: string | null;
  batasTimur: string | null;
  batasBarat: string | null;
  luasWilayah: number | null;
  keterangan: string | null;
  petaEmbedUrl: string | null;
}

// test-only: isi data/desa/wilayah-desa/wilayah-desa.json adalah data CONTOH, bukan data resmi desa.
const wilayahDesa = loadJsonData<WilayahDesaSeed>("desa/wilayah-desa/wilayah-desa.json");

/** Seed baris tunggal Letak & Batas Wilayah (idempoten, upsert by id tetap). */
export async function seedWilayahDesa() {
  console.log("🔄 Seeding Wilayah Desa...");
  await prisma.wilayahDesa.upsert({
    where: { id: WILAYAH_DESA_ID },
    update: wilayahDesa,
    create: { id: WILAYAH_DESA_ID, ...wilayahDesa },
  });
  console.log("✅ Wilayah Desa seeded");
}
