'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { useLoadOnce } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { PotensiLink } from './PotensiLink';
import { SektorUnggulanContent } from './SektorUnggulanContent';
import { loadSektorUnggulan } from './sektor-unggulan.source';
import s from './sektor-unggulan.module.css';
import { SEKTOR_UNGGULAN_TEXT as T } from './sektor-unggulan.text';

const noSearch = () => {};

/**
 * Halaman Sektor Unggulan Desa di kerangka Kabar (menu Inovasi/Lingkungan): kepala tanpa cari (daftar pendek
 * berperingkat), isi sesuai keadaan muat, lalu tautan ke Potensi Desa yang selalu tampil.
 */
export function SektorUnggulanPage() {
  const state = useLoadOnce(loadSektorUnggulan, 'sektor unggulan (Sektor Unggulan Desa)');
  return (
    <div className={kabar.section}>
      <KabarListHeader
        title={T.title}
        lead={T.lead}
        searchLabel={T.searchLabel}
        searchPlaceholder={T.searchPlaceholder}
        kategoriLabel={T.kategoriLabel}
        tabs={[]}
        search=""
        onSearch={noSearch}
        searchable={false}
      />
      <div className={s.blocks}>
        <SektorUnggulanContent state={state} />
        <PotensiLink />
      </div>
    </div>
  );
}
