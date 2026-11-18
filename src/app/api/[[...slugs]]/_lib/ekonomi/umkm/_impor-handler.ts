import prisma from "@/lib/prisma";
import { IMPOR_UMKM_MAKS_BARIS, type ModeImporUmkm } from "@/lib/umkm/umkm-impor.rules";
import type { BarisPesan } from "@/lib/umkm/umkm-impor-rencana";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";
import { guardAdmin } from "../../landing_page/desa-anti-korupsi/admin-guard";

export type BodyImpor = { mode: ModeImporUmkm; dryRun?: boolean; rows: unknown[] };
export type DbImpor = Pick<Prisma.TransactionClient, "umkm" | "kategoriProdukUmkm" | "pasarDesa" | "linkTokoOnline">;

type HasilRencana = { galat: BarisPesan[]; peringatan: BarisPesan[] };
type Jumlah = { ditambah: number; diperbarui: number; dilewati: number };

/** Yang berbeda antar impor (UMKM, Produk): teks, pembacaan DB, penyusunan rencana, dan penulisan. */
export type SpekImporServer<R extends HasilRencana> = {
  /** Mis. "UMKM" / "produk": dipakai di pesan sukses dan pesan galat. */
  objek: string;
  pesanAdmin: string;
  logLabel: string;
  susun: (db: DbImpor, body: BodyImpor) => Promise<R>;
  tulis: (tx: Prisma.TransactionClient, rencana: R) => Promise<void>;
  jumlah: (rencana: R) => Jumlah;
  /** Field tambahan di data dry-run (additive). */
  tambahan?: (rencana: R) => Record<string, number>;
};

const POTONGAN_IMPOR = 1000;
const CONTOH_MAKS = 50;
const contoh = (daftar: BarisPesan[]) => daftar.slice(0, CONTOH_MAKS);

/** Pecah daftar menjadi potongan ≤ `POTONGAN_IMPOR` untuk `createMany`. */
export function potongan<T>(daftar: readonly T[]): T[][] {
  const hasil: T[][] = [];
  for (let i = 0; i < daftar.length; i += POTONGAN_IMPOR) hasil.push(daftar.slice(i, i + POTONGAN_IMPOR));
  return hasil;
}

/**
 * Handler impor CSV (admin saja). `dryRun` hanya menghitung; impor sungguhan semua-atau-tidak-sama-sekali dalam
 * satu transaksi. Isi data tidak pernah di-log.
 */
export function buatHandlerImpor<R extends HasilRencana>(spek: SpekImporServer<R>) {
  return async function handlerImpor(context: Context) {
    const ditolak = await guardAdmin(context.set, spek.pesanAdmin);
    if (ditolak) return ditolak;

    const body = context.body as BodyImpor;
    if (body.rows.length === 0) {
      context.set.status = 400;
      return { success: false as const, message: "Tidak ada baris untuk diimpor" };
    }
    if (body.rows.length > IMPOR_UMKM_MAKS_BARIS) {
      context.set.status = 400;
      return { success: false as const, message: `Maksimal ${IMPOR_UMKM_MAKS_BARIS} baris per impor` };
    }

    try {
      if (body.dryRun) {
        const r = await spek.susun(prisma, body);
        return {
          success: true as const,
          message: `Pratinjau impor ${spek.objek}`,
          data: {
            ...spek.jumlah(r),
            galat: contoh(r.galat),
            totalGalat: r.galat.length,
            peringatan: contoh(r.peringatan),
            totalPeringatan: r.peringatan.length,
            ...spek.tambahan?.(r),
          },
        };
      }

      const hasil = await prisma.$transaction(
        async (tx) => {
          const r = await spek.susun(tx, body);
          if (r.galat.length > 0) return { ok: false as const, galat: r.galat };
          await spek.tulis(tx, r);
          return { ok: true as const, ...spek.jumlah(r) };
        },
        { timeout: 30_000 },
      );

      if (!hasil.ok) {
        context.set.status = 400;
        return {
          success: false as const,
          message: `Impor dibatalkan: ${hasil.galat.length} baris tidak valid. Tidak ada data yang disimpan`,
          galat: contoh(hasil.galat),
          totalGalat: hasil.galat.length,
        };
      }
      const { ditambah, diperbarui, dilewati } = hasil;
      return {
        success: true as const,
        message: `${ditambah} ${spek.objek} ditambah, ${diperbarui} diperbarui, ${dilewati} dilewati`,
        data: { ditambah, diperbarui, dilewati },
      };
    } catch (e) {
      // Pesan galat Prisma bisa memuat nilai kolom (nama/kontak), jadi hanya kelas galat & kode yang dicatat.
      const kode = (e as { code?: string } | null)?.code ?? "-";
      console.error(`Error di ${spek.logLabel}:`, e instanceof Error ? e.name : "Unknown", kode);
      context.set.status = 500;
      return { success: false as const, message: `Gagal mengimpor data ${spek.objek}` };
    }
  };
}
