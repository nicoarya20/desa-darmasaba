import prisma from "@/lib/prisma";
import kategoriDesaAntiKorupsi from "../../../data/landing-page/desa-anti-korupsi/kategoriDesaAntiKorupsi.json"
import desaAntiKorupsi from "../../../data/landing-page/desa-anti-korupsi/desaantiKorpusi.json"

export async function seedDesaAntiKorupsi() {
    for (const k of kategoriDesaAntiKorupsi) {
    await prisma.kategoriDesaAntiKorupsi.upsert({
      where: { id: k.id },
      update: {
        name: k.name,
      },
      create: {
        id: k.id,
        name: k.name,
      },
    });
  }
  console.log("kategori desa anti korupsi success ...");

  // =========== DESA ANTI KORUPSI ===========
  for (const p of desaAntiKorupsi) {
    await prisma.desaAntiKorupsi.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        deskripsi: p.deskripsi,
        kategoriId: p.kategoriId,
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsi: p.deskripsi,
        kategoriId: p.kategoriId,
      },
    });
  }
  console.log("desa anti korupsi success ...");
}