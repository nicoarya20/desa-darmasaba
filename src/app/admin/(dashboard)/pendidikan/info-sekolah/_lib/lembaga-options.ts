import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';

/**
 * Batas lembaga untuk pilihan form siswa/pengajar. Ditulis eksplisit karena bawaan `load()` = 10, dulu membuat
 * lembaga ke-11 dst. tidak bisa dipilih. Desa hanya punya puluhan lembaga.
 */
export const LEMBAGA_OPTION_LIMIT = 500;

/** Muat semua lembaga aktif untuk pilihan form, urut jenjang (TK, SD, SMP, …) lalu nama. */
export function loadLembagaOptions(): Promise<unknown> {
  return infoSekolahPaud.lembagaPendidikan.findMany.load(1, LEMBAGA_OPTION_LIMIT, '', '', true);
}

type LembagaRow = { id: string; nama: string; jenjangPendidikan?: { nama: string } | null };
export type LembagaOptionGroup = { group: string; items: { value: string; label: string }[] };

/** Data `Select` lembaga dikelompokkan per jenjang, urutan grup mengikuti urutan baris (API sudah urut jenjang). */
export function lembagaSelectData(rows: readonly LembagaRow[] | null | undefined): LembagaOptionGroup[] {
  const groups: LembagaOptionGroup[] = [];
  for (const row of rows ?? []) {
    const group = row.jenjangPendidikan?.nama ?? 'Lainnya';
    let target = groups.find((g) => g.group === group);
    if (!target) {
      target = { group, items: [] };
      groups.push(target);
    }
    target.items.push({ value: row.id, label: row.nama });
  }
  return groups;
}
