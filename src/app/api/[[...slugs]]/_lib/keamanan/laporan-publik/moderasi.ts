/**
 * Moderasi kiriman Laporan Publik: kiriman warga ditahan (status `Baru`) sampai admin menyetujuinya dengan
 * mengubah status. Satu sumber untuk status tertahan, filter tampil-publik, deteksi admin, dan batas kiriman.
 * Keputusan: docs/decisions/2026-11-14-laporan-publik-moderasi.md.
 */
import type { Prisma } from "@prisma/client";
import { createLimiter } from "@/app/api/auth/_lib/rateLimiter";
import { optionalAuth } from "@/lib/api-auth";
import { isAccountActive, isAdminRole } from "@/lib/auth-policy";

/** Status kiriman yang belum diverifikasi admin: tidak tampil di daftar, detail, maupun pencarian publik. */
export const STATUS_MENUNGGU_VERIFIKASI = "Baru" as const;

/** Filter Prisma "boleh tampil ke publik". */
export const WHERE_LAPORAN_TAMPIL_PUBLIK: Prisma.LaporanPublikWhereInput = {
  status: { not: STATUS_MENUNGGU_VERIFIKASI },
};

/** Batas kiriman form publik per alamat IP (non-admin). */
const KIRIMAN_MAKS = 5;
const KIRIMAN_JENDELA_MS = 10 * 60 * 1000;
export const laporanPublikKirimLimiter = createLimiter(KIRIMAN_MAKS, KIRIMAN_JENDELA_MS);

/** Apakah request membawa sesi admin aktif (role 0–4). Tanpa sesi / user biasa / akun nonaktif → false. */
export async function isAdminRequest(): Promise<boolean> {
  const user = await optionalAuth();
  return !!user && isAccountActive(user.isActive) && isAdminRole(user.roleId);
}

/**
 * Tampilan moderasi (`?moderasi=true`): ikut menampilkan laporan `Baru`. Hanya berlaku untuk sesi admin; selain itu
 * param diabaikan dan yang berlaku tampilan publik — tidak pernah membocorkan laporan tertahan.
 */
export async function isModerasiView(query: Record<string, unknown>): Promise<boolean> {
  return query.moderasi === "true" && (await isAdminRequest());
}

/**
 * Kunci rate limit dari alamat pengirim. `cf-connecting-ip` diisi Cloudflare (tak bisa dipalsukan pengirim);
 * `x-forwarded-for`/`x-real-ip` cadangan untuk lingkungan tanpa Cloudflare. Tanpa header → satu ember bersama.
 */
export function pengirimKey(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "tanpa-alamat"
  );
}
