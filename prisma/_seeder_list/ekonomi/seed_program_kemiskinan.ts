import prisma from "../../seed-prisma";
import { loadJsonData } from "../../load-json";

const programKemiskinan = loadJsonData("ekonomi/program-kemiskinan/program-kemiskinan.json");
const statistikKemiskinan = loadJsonData("ekonomi/program-kemiskinan/statistik-kemiskinan.json");

export async function seedProgramKemiskinan() {
  for (const s of statistikKemiskinan) {
      await prisma.statistikKemiskinan.upsert({
        where: { tahun: s.tahun }, // ✅ FIX
        update: {
          jumlah: s.jumlah,
        },
        create: {
          id: s.id, // id boleh tetap
          tahun: s.tahun,
          jumlah: s.jumlah,
        },
      });
    }
  
    console.log("📊 Statistik Kemiskinan seeded successfully");
  
    console.log("🔄 Seeding Program Kemiskinan...");
    // Program bantuan (PKH, CPP, BLT Desa) punya slug URL publik; statistik hanya untuk entri yang
    // membawa `tahun`. Penerima tidak di-seed: data warga diisi admin lewat impor CSV.
    for (const k of programKemiskinan) {
      const statistik = k.tahun ? { connect: { tahun: k.tahun } } : undefined;
      const data = {
        nama: k.nama,
        slug: k.slug ?? null,
        deskripsi: k.deskripsi,
        icon: k.icon,
        statistik,
      };
      await prisma.programKemiskinan.upsert({
        where: { id: k.id },
        update: data,
        create: { id: k.id, ...data },
      });
    }
    console.log("✅ Program Kemiskinan seeded successfully");
}