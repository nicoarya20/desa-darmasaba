'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { useLoadOnce, type LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { latestUpdate } from '@/app/(public)/_com/stat-bars/stat-bars.logic';
import { PengangguranSummary } from './PengangguranSummary';
import { DiperbaruiCaption, PengangguranCrossLink, PengangguranNotice, PengangguranSkeleton } from './PengangguranStates';
import { PengangguranTrend } from './PengangguranTrend';
import { pickLatestBulan, type PengangguranBulan } from './pengangguran.logic';
import { USIA_KERJA_MENGANGGUR_HREF } from './pengangguran.meta';
import s from './pengangguran.module.css';
import { loadPengangguranBulanan } from './pengangguran.source';
import { PENGANGGURAN_TEXT as T } from './pengangguran.text';

/** Kolom cari kepala tidak dipakai (data per bulan, bukan daftar teks). */
const noop = () => {};

/**
 * Halaman Jumlah Pengangguran di `.section` Kabar Desa: kepala, ringkasan bulan terbaru (3 kartu), perkembangan per
 * bulan (grafik + rincian), lalu tautan ke halaman sebaran usia & pendidikan.
 */
export function JumlahPengangguranPage() {
  const state = useLoadOnce(loadPengangguranBulanan, 'data bulanan (Jumlah Pengangguran)');

  return (
    <div className={kabar.section}>
      <KabarListHeader
        title={T.jumlah.title}
        lead={T.jumlah.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchLabel}
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search=""
        onSearch={noop}
        searchable={false}
      />
      <div className={s.stack}>
        <JumlahPengangguranContent state={state} />
        <PengangguranCrossLink href={USIA_KERJA_MENGANGGUR_HREF} label={T.jumlah.crossLink} />
      </div>
    </div>
  );
}

type ContentProps = { state: LoadState<PengangguranBulan[]> };

/** Isi halaman per keadaan muat (diekspor untuk test): kerangka, galat, kosong, atau ringkasan + perkembangan. */
export function JumlahPengangguranContent({ state }: ContentProps) {
  if (state.status === 'loading') return <PengangguranSkeleton label={T.jumlah.loading} />;
  if (state.status === 'error') return <PengangguranNotice>{T.jumlah.error}</PengangguranNotice>;

  const latest = pickLatestBulan(state.data);
  if (!latest) return <PengangguranNotice>{T.jumlah.empty}</PengangguranNotice>;

  return (
    <>
      <section className={s.block} aria-label={T.jumlah.summaryLabel}>
        <DiperbaruiCaption date={latestUpdate(state.data)} />
        <PengangguranSummary rows={state.data} latest={latest} />
      </section>
      <PengangguranTrend key={latest.tahun} rows={state.data} tahunAwal={latest.tahun} />
    </>
  );
}
