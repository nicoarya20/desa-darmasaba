import prisma from "@/lib/prisma";
import {
  parseFotoPembangunanInput,
  periksaFotoPembangunan,
  resolveFotoPembangunan,
  rujukanFoto,
  type FotoPembangunanInput,
} from "@/lib/kegiatan-pembangunan-foto";

type Hasil = { ok: true; data: FotoPembangunanInput } | { ok: false; message: string };

/**
 * Parse foto Pembangunan dari body, kosongkan untuk kategori non-Pembangunan, lalu pastikan semua berkas
 * yang dirujuk masih aktif dan bermime JPG/PNG/WebP dengan satu query FileStorage.
 */
export async function validasiFotoPembangunan(
  body: Record<string, unknown>,
  kategoriKegiatanId: string,
): Promise<Hasil> {
  const parsed = parseFotoPembangunanInput(body);
  if (!parsed.ok) return parsed;
  const foto = resolveFotoPembangunan(kategoriKegiatanId, parsed.data);

  const rujukan = rujukanFoto(foto);
  if (rujukan.length === 0) return { ok: true, data: foto };

  const rows = await prisma.fileStorage.findMany({
    where: { id: { in: Array.from(new Set(rujukan.map((r) => r.id))) }, isActive: true },
    select: { id: true, mimeType: true },
  });
  const cek = periksaFotoPembangunan(rujukan, rows);
  return cek.ok ? { ok: true, data: foto } : cek;
}
