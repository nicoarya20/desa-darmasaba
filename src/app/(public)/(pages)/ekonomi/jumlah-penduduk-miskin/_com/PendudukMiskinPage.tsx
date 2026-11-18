'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { useLoadOnce } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconLifebuoy } from '@tabler/icons-react';
import { EkonomiTerkait } from '../../_com/terkait/EkonomiTerkait';
import { PendudukMiskinContent } from './PendudukMiskinContent';
import { PROGRAM_KEMISKINAN_HREF } from './penduduk-miskin.meta';
import s from './penduduk-miskin.module.css';
import { loadPendudukMiskin } from './penduduk-miskin.source';
import { PENDUDUK_MISKIN_TEXT as T } from './penduduk-miskin.text';

const NO_TABS = [] as const;
const noSearch = () => {};

/**
 * Halaman Jumlah Penduduk Miskin di `.section` Kabar Desa: kepala tanpa cari, kartu tahun terbaru + batang per tahun
 * (modul `stat-bars`), lalu tautan silang ke Program Pengentasan Kemiskinan (tampil di semua keadaan). Muat sekali.
 */
export function PendudukMiskinPage() {
  const state = useLoadOnce(loadPendudukMiskin, 'jumlah penduduk miskin (Jumlah Penduduk Miskin)');
  return (
    <div className={kabar.section}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchLabel}
        kategoriLabel={T.kategoriLabel}
        tabs={NO_TABS}
        search=""
        onSearch={noSearch}
        searchable={false}
      />
      <div className={s.stack}>
        <PendudukMiskinContent state={state} />
        <EkonomiTerkait
          href={PROGRAM_KEMISKINAN_HREF}
          icon={<IconLifebuoy size={32} />}
          title={T.terkaitTitle}
          text={T.terkaitText}
          aksi={T.terkaitAksi}
        />
      </div>
    </div>
  );
}
