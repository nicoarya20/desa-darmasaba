import prisma from "@/lib/prisma";
import { susunRencanaImpor, type BarisPesan, type RencanaImpor } from "@/lib/umkm/umkm-impor-rencana";
import { IMPOR_UMKM_MAKS_BARIS, type ModeImporUmkm } from "@/lib/umkm/umkm-impor.rules";
import type { Prisma } from "@prisma/client";
import type { Context } from "elysia";
import { guardAdmin } from "../../landing_page/desa-anti-korupsi/admin-guard";

type BodyImpor = { mode: ModeImporUmkm; dryRun?: boolean; rows: unknown[] };
type DbImpor = Pick<Prisma.TransactionClient, "umkm" | "kategoriProdukUmkm">;

const POTONGAN = 1000;
const CONTOH_MAKS = 50;

/** Baca kategori aktif + UMKM yang belum dihapus (terlama dulu, supaya kunci kembar selalu jatuh ke yang sama). */
async function susunRencana(db: DbImpor, body: BodyImpor): Promise<RencanaImpor> {
  const kategori = await db.kategoriProdukUmkm.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, nama: true },
  });
  const ada = await db.umkm.findMany({
    where: { deletedAt: null },
    select: { id: true, nama: true, pemilik: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  return susunRencanaImpor({ rows: body.rows, mode: body.mode, kategori, ada });
}

const contoh = (daftar: BarisPesan[]) => daftar.slice(0, CONTOH_MAKS);

/**
 * POST /umkm/import — impor UMKM dari CSV (admin saja). `dryRun` hanya menghitung; impor sungguhan semua-atau-
 * tidak-sama-sekali dalam satu transaksi. Isi data (nama, pemilik, kontak) tidak pernah di-log.
 */
export default async function umkmImport(context: Context) {
  const ditolak = await guardAdmin(context.set, "Hanya admin yang boleh mengimpor data UMKM");
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
      const r = await susunRencana(prisma, body);
      return {
        success: true as const,
        message: "Pratinjau impor UMKM",
        data: {
          ditambah: r.tambah.length,
          diperbarui: r.perbarui.length,
          dilewati: r.dilewati,
          galat: contoh(r.galat),
          totalGalat: r.galat.length,
          peringatan: contoh(r.peringatan),
          totalPeringatan: r.peringatan.length,
        },
      };
    }

    const hasil = await prisma.$transaction(
      async (tx) => {
        const r = await susunRencana(tx, body);
        if (r.galat.length > 0) return { ok: false as const, galat: r.galat };
        for (let i = 0; i < r.tambah.length; i += POTONGAN) {
          await tx.umkm.createMany({ data: r.tambah.slice(i, i + POTONGAN) });
        }
        for (const u of r.perbarui) await tx.umkm.update({ where: { id: u.id }, data: u.data });
        return { ok: true as const, ditambah: r.tambah.length, diperbarui: r.perbarui.length, dilewati: r.dilewati };
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
    return {
      success: true as const,
      message: `${hasil.ditambah} UMKM ditambah, ${hasil.diperbarui} diperbarui, ${hasil.dilewati} dilewati`,
      data: { ditambah: hasil.ditambah, diperbarui: hasil.diperbarui, dilewati: hasil.dilewati },
    };
  } catch (e) {
    // Pesan galat Prisma bisa memuat nilai kolom (nama/kontak), jadi hanya kelas galat & kode yang dicatat.
    const kode = (e as { code?: string } | null)?.code ?? "-";
    console.error("Error di umkmImport:", e instanceof Error ? e.name : "Unknown", kode);
    context.set.status = 500;
    return { success: false as const, message: "Gagal mengimpor data UMKM" };
  }
}
