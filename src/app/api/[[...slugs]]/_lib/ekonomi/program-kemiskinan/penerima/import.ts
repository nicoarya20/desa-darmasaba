import prisma from "@/lib/prisma";
import { IMPOR_MAKS_BARIS, validasiPenerima, validasiTahun, type PenerimaInput } from "@/lib/program-kemiskinan/penerima.rules";
import type { Context } from "elysia";
import { badRequest, guardAdminPenerima, notFound, programAda } from "./penerima.body";

/** `tambah` = sisipkan di akhir data tahun itu; `ganti` = hapus seluruh data tahun itu lalu isi ulang. */
export type ModeImpor = "tambah" | "ganti";
type BodyImpor = { programId?: string; tahun?: unknown; mode?: unknown; rows?: unknown };

const POTONGAN = 1000;
const CONTOH_GALAT_MAKS = 10;

/** Validasi semua baris impor; hanya `nama` & `alamat` yang diambil dari tiap objek (kolom lain dibuang). */
export function validasiBarisImpor(rows: unknown): { ok: true; value: PenerimaInput[] } | { ok: false; alasan: string } {
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, alasan: "Tidak ada baris untuk diimpor" };
  if (rows.length > IMPOR_MAKS_BARIS) return { ok: false, alasan: `Maksimal ${IMPOR_MAKS_BARIS} baris per impor` };
  const bersih: PenerimaInput[] = [];
  const galat: string[] = [];
  rows.forEach((r, i) => {
    const v = validasiPenerima((r ?? {}) as Record<string, unknown>);
    if (v.ok) bersih.push(v.value);
    else if (galat.length < CONTOH_GALAT_MAKS) galat.push(`baris ${i + 1}: ${v.alasan}`);
  });
  if (galat.length > 0) return { ok: false, alasan: `Data tidak valid (${galat.join("; ")})` };
  return { ok: true, value: bersih };
}

/** POST /penerima/import — impor banyak penerima satu tahun dalam satu transaksi (semua atau tidak sama sekali). */
export default async function penerimaImport(context: Context) {
  const ditolak = await guardAdminPenerima(context.set);
  if (ditolak) return ditolak;

  const body = (context.body ?? {}) as BodyImpor;
  const tahun = validasiTahun(body.tahun);
  if (!tahun.ok) return badRequest(context.set, tahun.alasan);
  if (body.mode !== "tambah" && body.mode !== "ganti") return badRequest(context.set, "Mode impor harus 'tambah' atau 'ganti'");
  const rows = validasiBarisImpor(body.rows);
  if (!rows.ok) return badRequest(context.set, rows.alasan);
  const programId = String(body.programId ?? "").trim();
  if (!(await programAda(programId))) return notFound(context.set, "Program tidak ditemukan");

  const mode: ModeImpor = body.mode;
  const hasil = await prisma.$transaction(async (tx) => {
    const dihapus =
      mode === "ganti" ? (await tx.penerimaProgramKemiskinan.deleteMany({ where: { programId, tahun: tahun.value } })).count : 0;
    const terakhir =
      mode === "ganti"
        ? null
        : (await tx.penerimaProgramKemiskinan.aggregate({ where: { programId, tahun: tahun.value }, _max: { urutan: true } }))._max
            .urutan;
    const mulai = (terakhir ?? -1) + 1;
    let ditambah = 0;
    for (let i = 0; i < rows.value.length; i += POTONGAN) {
      const potong = rows.value.slice(i, i + POTONGAN).map((r, j) => ({ ...r, programId, tahun: tahun.value, urutan: mulai + i + j }));
      ditambah += (await tx.penerimaProgramKemiskinan.createMany({ data: potong })).count;
    }
    return { dihapus, ditambah };
  }, { timeout: 30_000 });
  return { success: true as const, message: `${hasil.ditambah} penerima diimpor untuk tahun ${tahun.value}`, data: hasil };
}
