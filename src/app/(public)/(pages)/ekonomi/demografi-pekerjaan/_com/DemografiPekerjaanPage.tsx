'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { useLoadOnce, type LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import { formatTanggal } from '@/app/(public)/_com/main-page/apbdes/apbdes.logic';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { StatBarsPanel } from '@/app/(public)/_com/stat-bars/StatBarsPanel';
import { StatBarsEmpty, StatBarsError, StatBarsSkeleton } from '@/app/(public)/_com/stat-bars/StatBarsStates';
import { IconBriefcase } from '@tabler/icons-react';
import { summarizeDemografiPekerjaan, type DemografiPekerjaanItem } from './demografi-pekerjaan.logic';
import { loadDemografiPekerjaan } from './demografi-pekerjaan.source';
import { DEMOGRAFI_PEKERJAAN_TEXT as T } from './demografi-pekerjaan.text';

const PANEL_TITLE_ID = 'demografi-pekerjaan-panel-title';
const SEGMENTS = [{ label: T.laki }, { label: T.perempuan }] as const;

/** Kolom cari kepala tidak dipakai (satu panel statistik, bukan daftar teks). */
const noop = () => {};

/** Halaman Demografi Pekerjaan di `.section` Kabar Desa: kepala, lalu satu panel batang bersegmen laki-laki | perempuan. */
export function DemografiPekerjaanPage() {
  const state = useLoadOnce(loadDemografiPekerjaan, 'data demografi pekerjaan (Demografi Pekerjaan)');
  return (
    <div className={kabar.section}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchLabel}
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search=""
        onSearch={noop}
        searchable={false}
      />
      <DemografiPekerjaanContent state={state} />
    </div>
  );
}

/** Isi per keadaan muat (diekspor untuk test): kerangka, galat, ubin kosong, atau panel. */
export function DemografiPekerjaanContent({ state }: { state: LoadState<DemografiPekerjaanItem[]> }) {
  if (state.status === 'loading') return <StatBarsSkeleton label={T.loading} rows={6} />;
  if (state.status === 'error') return <StatBarsError message={T.failed} />;
  if (state.data.length === 0) {
    return <StatBarsEmpty icon={<IconBriefcase size={24} stroke={1.75} />} title={T.emptyTitle} body={T.emptyBody} />;
  }
  const summary = summarizeDemografiPekerjaan(state.data);
  return (
    <StatBarsPanel
      titleId={PANEL_TITLE_ID}
      title={T.panelTitle}
      caption={T.panelCaption}
      meta={summary.latest ? T.updated(formatTanggal(summary.latest)) : undefined}
      summary={summary}
      unit={T.unit}
      totalLabel={T.totalLabel}
      segments={SEGMENTS}
      notFilledLabel={T.notFilled}
      footnote={summary.belumDiisi > 0 && summary.total !== null ? T.notFilledNote(summary.belumDiisi) : undefined}
    />
  );
}
