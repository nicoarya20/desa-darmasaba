'use client';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import { useLoadOnce, type LoadState } from '@/app/(public)/_com/load-once/use-load-once';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { StatBarsEmpty, StatBarsError, StatBarsSkeleton } from '@/app/(public)/_com/stat-bars/StatBarsStates';
import type { LembagaKomunitasRecord } from '@/lib/lembaga-komunitas';
import { IconUsersGroup } from '@tabler/icons-react';
import { LembagaKomunitasKartu } from './LembagaKomunitasKartu';
import { kelompokkanPerJenis } from './lembaga-komunitas.logic';
import { loadLembagaKomunitas } from './lembaga-komunitas.source';
import { LEMBAGA_KOMUNITAS_TEXT as T } from './lembaga-komunitas.text';
import s from './lembaga-komunitas.module.css';

/** Kolom cari kepala tidak dipakai (daftar pendek dikelompokkan per jenis, bukan daftar teks berpaginasi). */
const noop = () => {};

/** Halaman Lembaga & Komunitas di `.section` Kabar Desa: kepala, lalu isi sesuai keadaan muat. */
export function LembagaKomunitasPage() {
  const state = useLoadOnce(loadLembagaKomunitas, 'daftar Lembaga & Komunitas');
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
      <LembagaKomunitasContent state={state} />
    </div>
  );
}

/** Isi per keadaan muat (diekspor untuk test): kerangka, galat, ubin kosong, atau kelompok jenis berisi kartu. */
export function LembagaKomunitasContent({ state }: { state: LoadState<LembagaKomunitasRecord[]> }) {
  if (state.status === 'loading') return <StatBarsSkeleton label={T.loading} rows={4} />;
  if (state.status === 'error') return <StatBarsError message={T.failed} />;
  if (state.data.length === 0) {
    return <StatBarsEmpty icon={<IconUsersGroup size={24} stroke={1.75} />} title={T.emptyTitle} body={T.emptyBody} />;
  }
  return (
    <div className={s.content}>
      {kelompokkanPerJenis(state.data).map((grup, index) => (
        <section key={grup.kunci} className={s.group} aria-labelledby={`lk-grup-${index}`}>
          <h2 id={`lk-grup-${index}`} className={s.groupTitle}>{grup.jenis}</h2>
          <ul className={s.grid}>
            {grup.items.map((item) => (
              <LembagaKomunitasKartu key={item.id} item={item} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
