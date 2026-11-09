// Info ringkas satu dokumen di halaman program publik: tipe, ukuran, tanggal unggah (WITA).
import { DESA_TIME_ZONE } from '@/app/darmasaba/_com/main-page/apbdes/apbdes.logic';
import { fileExtension, type DokumenDesaAntiKorupsiView } from '@/lib/desa-anti-korupsi-dokumen';
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';

const tanggalRingkas = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: DESA_TIME_ZONE,
});

/** Tanggal unggah ringkas id-ID zona WITA (mis. "9 Nov 2026"); ISO tidak valid → "—". */
export function formatTanggalUnggah(iso: string | null | undefined): string {
  const time = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(time) ? '—' : tanggalRingkas.format(time);
}

/** Info tampilan dokumen: label tipe ("PDF"), ukuran ("1 KB" / "—"), tanggal unggah. */
export type DokumenInfo = { tipe: string; ukuran: string; tanggal: string };

/** Hitung info tampilan satu dokumen. */
export function dokumenInfo(d: DokumenDesaAntiKorupsiView): DokumenInfo {
  return {
    tipe: fileExtension(d.file.realName, d.file.mimeType),
    ukuran: formatUkuran(d.file.size),
    tanggal: formatTanggalUnggah(d.createdAt),
  };
}

/** Satu baris keterangan (dipakai di mobile): "PDF · 1 KB · 9 Nov 2026". */
export function ringkasInfo(info: DokumenInfo): string {
  return [info.tipe, info.ukuran, info.tanggal].join(' · ');
}
