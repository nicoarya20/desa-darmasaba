'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { useLoadOnce } from '@/app/(public)/_com/load-once/use-load-once';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { PengangguranCrossLink } from './PengangguranStates';
import { SebaranSection } from './SebaranSection';
import { JUMLAH_PENGANGGURAN_HREF } from './pengangguran.meta';
import s from './pengangguran.module.css';
import { loadSebaranPendidikan, loadSebaranUsia } from './pengangguran.source';
import { PENGANGGURAN_TEXT as T } from './pengangguran.text';

/** Kolom cari kepala tidak dipakai (dua panel angka, bukan daftar). */
const noop = () => {};

/**
 * Halaman Penduduk Usia Kerja yang Menganggur di `.section` Kabar Desa: kepala, sebaran menurut usia, sebaran menurut
 * pendidikan terakhir (dimuat terpisah; galat satu panel tidak menyembunyikan yang lain), lalu tautan ke data per bulan.
 */
export function UsiaKerjaMenganggurPage() {
  const usia = useLoadOnce(loadSebaranUsia, 'sebaran usia (Usia Kerja yang Menganggur)');
  const pendidikan = useLoadOnce(loadSebaranPendidikan, 'sebaran pendidikan (Usia Kerja yang Menganggur)');

  return (
    <div className={kabar.section} style={KABAR_BRAND_VARS}>
      <KabarListHeader
        title={T.usia.title}
        lead={T.usia.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchLabel}
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search=""
        onSearch={noop}
        searchable={false}
      />
      <div className={s.stack}>
        <SebaranSection id="sebaran-usia-title" title={T.usia.usiaTitle} state={usia} />
        <SebaranSection id="sebaran-pendidikan-title" title={T.usia.pendidikanTitle} state={pendidikan} />
        <PengangguranCrossLink href={JUMLAH_PENGANGGURAN_HREF} label={T.usia.crossLink} />
      </div>
    </div>
  );
}
