import prisma from "../../seed-prisma";
import { validateLinkTokoOnlineList } from "@/lib/link-toko-online";
import { loadJsonData } from "../../load-json";

type LinkTokoOnlineSeed = { produkId: string; links: { platform: string; url: string }[] };

// Data contoh (lihat "keterangan" di JSON) — wajib diganti admin dengan link toko resmi.
const linkTokoOnline = loadJsonData<{ keterangan: string; data: LinkTokoOnlineSeed[] }>(
  "ekonomi/pasar-desa/link-toko-online.json",
);

/** Mengisi link toko online contoh hanya untuk produk yang belum punya link, agar link dari admin tidak tertimpa. */
export async function seedLinkTokoOnline() {
  console.log("🔄 Seeding Link Toko Online (data contoh)...");

  const produkIds = linkTokoOnline.data.map((item) => item.produkId);
  const sudahAda = await prisma.linkTokoOnline.findMany({
    where: { produkId: { in: produkIds } },
    select: { produkId: true },
    distinct: ["produkId"],
  });
  const produkBerLink = new Set(sudahAda.map((row) => row.produkId));

  for (const item of linkTokoOnline.data) {
    if (produkBerLink.has(item.produkId)) {
      console.log(`  ⏭️ Produk ${item.produkId} sudah punya link, dilewati`);
      continue;
    }

    // Validasi yang sama dengan API produk, supaya seed tidak menyimpan link yang ditolak form admin.
    const cek = validateLinkTokoOnlineList(item.links);
    if (!cek.ok) {
      throw new Error(`Seed link toko online produk ${item.produkId} tidak valid: ${cek.message}`);
    }

    await prisma.linkTokoOnline.createMany({
      data: cek.data.map((link) => ({ ...link, produkId: item.produkId })),
    });
    console.log(`  ✅ ${cek.data.length} link untuk produk ${item.produkId}`);
  }

  console.log("✅ Link Toko Online seeded successfully");
}
