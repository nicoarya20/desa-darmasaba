// Validasi body admin penerima Program Kemiskinan di boundary API (create/update/impor).
import prisma from "@/lib/prisma";
import {
  validasiPenerima,
  validasiTahun,
  type PenerimaInput,
  type Validasi,
} from "@/lib/program-kemiskinan/penerima.rules";
import type { Context } from "elysia";
import { guardAdmin } from "../../../landing_page/desa-anti-korupsi/admin-guard";

/** Penerima + tahun yang sudah tervalidasi. */
export type PenerimaTahunInput = PenerimaInput & { tahun: number };

/** Validasi body `{ tahun, nama, alamat }`: tahun masuk akal, nama/alamat wajib & dirapikan. */
export function validasiBodyPenerima(body: { tahun?: unknown; nama?: unknown; alamat?: unknown }): Validasi<PenerimaTahunInput> {
  const tahun = validasiTahun(body.tahun);
  if (!tahun.ok) return tahun;
  const p = validasiPenerima(body);
  if (!p.ok) return p;
  return { ok: true, value: { ...p.value, tahun: tahun.value } };
}

/** Balasan 400 seragam untuk body yang tidak valid. */
export function badRequest(set: Context["set"], message: string) {
  set.status = 400;
  return { success: false as const, message };
}

/** Balasan 404 seragam. */
export function notFound(set: Context["set"], message: string) {
  set.status = 404;
  return { success: false as const, message };
}

/** Guard admin (role 0-4) untuk semua endpoint kelola penerima — data warga, bukan sekadar login. */
export function guardAdminPenerima(set: Context["set"]) {
  return guardAdmin(set, "Hanya admin yang boleh mengelola penerima program kemiskinan");
}

/** Program ada (aktif maupun nonaktif) — admin boleh mengisi penerima program yang belum ditayangkan. */
export async function programAda(programId: string): Promise<boolean> {
  if (!programId) return false;
  const p = await prisma.programKemiskinan.findUnique({ where: { id: programId }, select: { id: true } });
  return p !== null;
}
