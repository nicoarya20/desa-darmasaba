// Info ringkas draft dokumen di editor admin Desa Anti Korupsi (ukuran, tanggal unggah, label "Baru")
// — murni, dipakai baris draft dan pengurutan isi folder.
import { DESA_TIME_ZONE } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import { formatUkuran } from '@/lib/desa-anti-korupsi-sort';
import type { DokumenDraft } from './dokumen-draft';

/** Label untuk dokumen yang belum tersimpan di program ini (belum punya tanggal unggah). */
export const DRAFT_BARU_LABEL = 'Baru';

const tanggalFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: DESA_TIME_ZONE,
});

/** Ukuran berkas draft (byte): ukuran tersimpan, atau File.size untuk berkas yang belum diunggah; null = tak diketahui. */
export function draftUkuran(draft: Pick<DokumenDraft, 'size' | 'file'>): number | null {
  return draft.size ?? draft.file?.size ?? null;
}

/** Draft belum tersimpan di program ini (berkas baru atau salinan) — belum punya tanggal unggah sendiri. */
export function isDraftBaru(draft: Pick<DokumenDraft, 'id'>): boolean {
  return !draft.id;
}

/** Waktu unggah draft untuk pengurutan: createdAt dokumen tersimpan, atau `now` untuk draft baru. */
export function draftTanggal(draft: Pick<DokumenDraft, 'id' | 'createdAt'>, now: Date): string {
  return !isDraftBaru(draft) && draft.createdAt ? draft.createdAt : now.toISOString();
}

/** Tanggal unggah ringkas id-ID di zona waktu desa ("9 Nov 2026"); "—" bila kosong/tidak valid. */
export function formatTanggalUnggah(iso: string | undefined): string {
  const time = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(time) ? '—' : tanggalFormat.format(new Date(time));
}

/** Teks info baris draft: ukuran berkas + tanggal unggah, atau label "Baru" untuk draft belum tersimpan. */
export function draftInfo(draft: DokumenDraft): { ukuran: string; tanggal: string; baru: boolean } {
  const baru = isDraftBaru(draft);
  return {
    ukuran: formatUkuran(draftUkuran(draft)),
    tanggal: baru ? DRAFT_BARU_LABEL : formatTanggalUnggah(draft.createdAt),
    baru,
  };
}
