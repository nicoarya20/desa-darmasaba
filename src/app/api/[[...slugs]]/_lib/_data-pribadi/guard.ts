import type { Context } from "elysia";
import { guardAdmin, type AdminGuardFail } from "../landing_page/desa-anti-korupsi/admin-guard";

// Guard GET berisi data pribadi warga (NIK, nomor HP, alamat, nama anak) — UU PDP & aspek 8 lomba.
// Dipasang per rute (`{ beforeHandle: guardDataPribadi }`), bukan prefix di route.ts, supaya master data
// publik di bawah path yang sama (jenis layanan/pengaduan) tidak ikut tertutup. Alasan: docs/decisions/2026-11-17-api-data-pribadi-admin-only.md

export const PESAN_DATA_PRIBADI_BUKAN_ADMIN = "Hanya admin yang boleh melihat data pribadi warga";

/** beforeHandle rute data pribadi: 401 tanpa sesi, 403 akun nonaktif/bukan admin (role 0-4), lolos bila admin. */
export async function guardDataPribadi({ set }: Pick<Context, "set">): Promise<AdminGuardFail | undefined> {
  const fail = await guardAdmin(set, PESAN_DATA_PRIBADI_BUKAN_ADMIN);
  return fail ?? undefined;
}
