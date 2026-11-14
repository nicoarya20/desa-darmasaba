import prisma from "@/lib/prisma";
import { sanitizeRichTextForStorage } from "@/lib/rich-text-server";
import { Context } from "elysia";
import { STATUS_MENUNGGU_VERIFIKASI, isAdminRequest, laporanPublikKirimLimiter, pengirimKey } from "./moderasi";

type LaporanPublikInput = {
  judul: string;
  lokasi: string;
  tanggalWaktu: string;
  kronologi?: string;
};

const laporanPublikCreate = async (context: Context) => {
  // Endpoint terbuka untuk warga anonim: kiriman non-admin dibatasi per alamat dan ditahan sampai diverifikasi.
  const admin = await isAdminRequest();
  if (!admin) {
    const limit = laporanPublikKirimLimiter.check(pengirimKey(context.request.headers));
    if (!limit.allowed) {
      const detik = Math.ceil(limit.retryAfterMs / 1000);
      context.set.status = 429;
      context.set.headers["Retry-After"] = String(detik);
      return { success: false, message: `Terlalu banyak laporan dikirim. Coba lagi dalam ${detik} detik.` };
    }
  }

  const { judul, lokasi, tanggalWaktu, kronologi } =
    (await context.body) as LaporanPublikInput;

    const createdLaporanPublik = await prisma.laporanPublik.create({
        data: {
            judul,
            lokasi,
            tanggalWaktu: new Date(tanggalWaktu),
            // Admin: status bawaan schema (Proses, langsung tampil). Selain itu menunggu verifikasi admin.
            ...(admin ? {} : { status: STATUS_MENUNGGU_VERIFIKASI }),
            // Endpoint publik tanpa login: HTML kiriman warga dibersihkan sebelum disimpan (cegah XSS tersimpan).
            kronologi: kronologi === undefined ? undefined : sanitizeRichTextForStorage(kronologi),
        }
    })

    return {
        success: true,
        data: createdLaporanPublik,
    };
};
export default laporanPublikCreate;
