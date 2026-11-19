'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { useLoadOnce, type LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { StatBarsEmpty, StatBarsError, StatBarsSkeleton } from '@/app/(public)/_com/stat-bars/StatBarsStates';
import type { IndeksDesaRecord } from '@/lib/indeks-desa';
import { IconChartBar } from '@tabler/icons-react';
import { IndeksDesaRingkasan } from './IndeksDesaRingkasan';
import { IndeksDesaRiwayat } from './IndeksDesaRiwayat';
import { loadIndeksDesa } from './indeks-desa.source';
import { INDEKS_DESA_TEXT as T } from './indeks-desa.text';
import s from './indeks-desa.module.css';

/** Kolom cari kepala tidak dipakai (satu halaman data, bukan daftar teks). */
const noop = () => {};

/** Halaman Indeks Desa Membangun di `.section` Kabar Desa: kepala, lalu isi sesuai keadaan muat. */
export function IndeksDesaPage() {
  const state = useLoadOnce(loadIndeksDesa, 'data Indeks Desa (Indeks Desa Membangun)');
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
      <IndeksDesaContent state={state} />
    </div>
  );
}

/** Isi per keadaan muat (diekspor untuk test): kerangka, galat, ubin kosong, atau ringkasan + riwayat. */
export function IndeksDesaContent({ state }: { state: LoadState<IndeksDesaRecord[]> }) {
  if (state.status === 'loading') return <StatBarsSkeleton label={T.loading} rows={4} />;
  if (state.status === 'error') return <StatBarsError message={T.failed} />;
  const [latest] = state.data;
  if (!latest) {
    return <StatBarsEmpty icon={<IconChartBar size={24} stroke={1.75} />} title={T.emptyTitle} body={T.emptyBody} />;
  }
  return (
    <div className={s.content}>
      <IndeksDesaRingkasan latest={latest} />
      <IndeksDesaRiwayat items={state.data} />
    </div>
  );
}
