/**
 * Kontrak data Dashboard Kependudukan: satu `DatasetSlice` per section.
 * Diisi oleh `use-kependudukan-data.ts`; tiap section mem-parse `rows` dengan parser miliknya sendiri.
 */

/** Kunci dataset = satu section dashboard (anchor `#banjar`, `#umur`, `#agama`, `#dinamika`). */
export type DatasetKey = 'banjar' | 'umur' | 'agama' | 'dinamika';

/** Satu dataset untuk satu section. `rows` = baris mentah API untuk `tahun` terpilih; `allRows` = semua tahun. */
export type DatasetSlice = {
  status: 'loading' | 'error' | 'ready';
  tahun: number | null;          // tahun terbaru yang punya data; null bila kosong
  tahunTersedia: number[];       // urut menurun
  rows: unknown[];               // baris tahun terpilih (mentah — section yang mem-parse)
  allRows: unknown[];            // semua baris (dipakai riwayat Dinamika)
  retry: () => void;
};

/** Seluruh data dashboard, satu slice per section. */
export type KependudukanData = Record<DatasetKey, DatasetSlice>;
