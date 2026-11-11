import prisma from "@/lib/prisma";
import {
  parseLampiran,
  periksaBerkas,
  rujukanBerkas,
  type LampiranParsed,
  type PengumumanBody,
} from "@/lib/pengumuman-lampiran";

type Hasil = { ok: true; data: LampiranParsed } | { ok: false; message: string };

/**
 * Validasi lampiran + tanggal terbit dari body, lalu pastikan semua berkas yang dirujuk masih aktif
 * dan jenisnya benar (gambar / PDF) dengan satu query FileStorage.
 */
export async function validasiLampiran(body: PengumumanBody): Promise<Hasil> {
  const parsed = parseLampiran(body);
  if (!parsed.ok) return parsed;

  const rujukan = rujukanBerkas(parsed.data);
  const ids = [...rujukan.gambar, ...rujukan.dokumen];
  if (ids.length === 0) return parsed;

  const rows = await prisma.fileStorage.findMany({
    where: { id: { in: ids }, isActive: true },
    select: { id: true, mimeType: true },
  });
  const cek = periksaBerkas(rujukan, rows);
  return cek.ok ? parsed : cek;
}
