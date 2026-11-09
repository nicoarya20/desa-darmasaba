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
    for (const k of programKemiskinan) {
      await prisma.programKemiskinan.upsert({
        where: { id: k.id },
        update: {
          nama: k.nama,
          deskripsi: k.deskripsi,
          icon: k.icon,
          statistik: {
            connect: {
              tahun: k.tahun, // 👈 BUKAN ID
            },
          },
        },
        create: {
          id: k.id,
          nama: k.nama,
          deskripsi: k.deskripsi,
          icon: k.icon,
          statistik: {
            connect: {
              tahun: k.tahun,
            },
          },
        },
      });
    }
    console.log("✅ Program Kemiskinan seeded successfully");
}