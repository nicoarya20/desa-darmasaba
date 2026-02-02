import prisma from "@/lib/prisma";
import grafikMenganggurBerdasarkanUsia from "../../data/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran-berdasarkan-usia.json";
import grafikMenganggurBerdasarkanPendidikan from "../../data/ekonomi/jumlah-penduduk-usia-kerja-yang-menganggur/pengangguran-berdasarkan-pendidikan.json";

export async function seedPendudukUsiaKerjaYangMenganggur() {
  for (const p of grafikMenganggurBerdasarkanUsia) {
    await prisma.grafikMenganggurBerdasarkanUsia.upsert({
      where: {
        id: p.id,
      },
      update: {
        usia18_25: p.usia18_25,
        usia26_35: p.usia26_35,
        usia36_45: p.usia36_45,
        usia46_keatas: p.usia46_keatas,
      },
      create: {
        id: p.id,
        usia18_25: p.usia18_25,
        usia26_35: p.usia26_35,
        usia36_45: p.usia36_45,
        usia46_keatas: p.usia46_keatas,
      },
    });
  }
  console.log("📊 grafikMenganggurBerdasarkanUsia success ...");
  for (const p of grafikMenganggurBerdasarkanPendidikan) {
    await prisma.grafikMenganggurBerdasarkanPendidikan.upsert({
      where: {
        id: p.id,
      },
      update: {
        SD: p.SD,
        SMP: p.SMP,
        SMA: p.SMA,
        D3: p.D3,
        S1: p.S1,
      },
      create: {
        id: p.id,
        SD: p.SD,
        SMP: p.SMP,
        SMA: p.SMA,
        D3: p.D3,
        S1: p.S1,
      },
    });
  }
  console.log("📊 grafikMenganggurBerdasarkanUsia success ...");
}
