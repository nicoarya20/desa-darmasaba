import type { Prisma } from "@prisma/client";

/**
 * Logika inti pesanan publik UMKM (tanpa import prisma client → mudah di-test
 * dengan mock). Dipanggil di dalam prisma.$transaction oleh handler `pesan.ts`.
 */

// Batas wajar per pesanan; juga menjaga jumlah * harga tetap muat di kolom Int
// (totalNilai) sehingga tidak berujung error DB 500 untuk input ekstrem.
export const PESAN_MAX_JUMLAH = 1000;

export type PesanInput = { produkId: string; jumlah: number };

export const PESAN_HARGA_KOSONG = "Harga produk ini menyesuaikan. Silakan hubungi penjual lewat WhatsApp.";

export type PesanTx = Pick<Prisma.TransactionClient, "pasarDesa" | "penjualanProduk">;

export type PesanResult =
  | {
      ok: true;
      penjualan: {
        id: string;
        produkId: string;
        jumlah: number;
        hargaSatuan: number;
        totalNilai: number;
        tanggal: Date;
      };
    }
  | { ok: false; status: 404 | 409; message: string };

/** Periode pembukuan bulanan format "YYYY-MM" (sama dengan endpoint create admin). */
export function periodeOf(tanggal: Date): string {
  return `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Catat pesanan warga: harga SELALU dari DB (klien anonim tidak dipercaya) dan
 * stok dikurangi atomik lewat `updateMany` bersyarat `stok >= jumlah`, sehingga
 * dua pesanan bersamaan tidak bisa membuat stok minus (cek-lalu-update lama
 * rawan race pada isolasi read-committed).
 */
export async function buatPesanan(
  tx: PesanTx,
  input: PesanInput,
  now: Date = new Date(),
): Promise<PesanResult> {
  const aktif = { id: input.produkId, deletedAt: null, isActive: true };

  const produk = await tx.pasarDesa.findFirst({
    where: aktif,
    select: { harga: true, stok: true },
  });
  if (!produk) {
    return { ok: false, status: 404, message: "Produk tidak ditemukan atau sudah tidak dijual" };
  }
  // Harga opsional (tidak tetap): total tidak bisa dihitung, jadi pesanan website ditolak sebelum stok dikurangi.
  const harga = produk.harga;
  if (harga === null) {
    return { ok: false, status: 409, message: PESAN_HARGA_KOSONG };
  }

  const { count } = await tx.pasarDesa.updateMany({
    where: { ...aktif, stok: { gte: input.jumlah } },
    data: { stok: { decrement: input.jumlah } },
  });
  if (count === 0) {
    return { ok: false, status: 409, message: `Stok tidak mencukupi. Tersedia: ${produk.stok}` };
  }

  const penjualan = await tx.penjualanProduk.create({
    data: {
      produkId: input.produkId,
      jumlah: input.jumlah,
      hargaSatuan: harga,
      totalNilai: harga * input.jumlah,
      tanggal: now,
      periode: periodeOf(now),
    },
    select: {
      id: true,
      produkId: true,
      jumlah: true,
      hargaSatuan: true,
      totalNilai: true,
      tanggal: true,
    },
  });

  return { ok: true, penjualan };
}
