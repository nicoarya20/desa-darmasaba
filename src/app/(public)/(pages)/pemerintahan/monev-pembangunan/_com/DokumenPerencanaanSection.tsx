'use client'
import apb from '@/app/(public)/_com/main-page/apbdes/apbdes.module.css';
import { KabarListPagination } from '@/app/(public)/_com/kabar-list/KabarListPagination';
import stateDokumenPerencanaanPublik from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaanPublik';
import type { DokumenPerencanaanItem } from '@/app/admin/(dashboard)/_state/desa/dokumenPerencanaan';
import {
  DOKUMEN_PERENCANAAN_SECTION_ID,
  JENIS_DOKUMEN,
  JENIS_DOKUMEN_LABEL,
  type JenisDokumen,
} from '@/lib/dokumen-perencanaan';
import { ScrollArea, SegmentedControl } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { DokumenPerencanaanRow } from './DokumenPerencanaanRow';
import s from './monev.module.css';
import r from './monev-rows.module.css';
import { MONEV_TEXT } from './monev.text';
import { MonevNotice, RowsSkeleton } from './MonevStates';

const SKELETON_ROWS = 3;
const TITLE_ID = 'dokumen-perencanaan-title';
// Label panjang disingkat di ponsel (sisa label disembunyikan CSS) agar ketiga tab muat tanpa digeser.
const tabOptions = JENIS_DOKUMEN.map((v) => {
  const full = JENIS_DOKUMEN_LABEL[v];
  const short = MONEV_TEXT.docTabShort[v];
  if (!short || !full.startsWith(short)) return { value: v, label: full };
  return { value: v, label: <span>{short}<span className={r.wideOnly}>{full.slice(short.length)}</span></span> };
});

/** Section publik "Dokumen Perencanaan": tab RPJM | RKP | Berita Acara, baris dokumen, keadaan kosong. */
export default function DokumenPerencanaanSection() {
  const state = useProxy(stateDokumenPerencanaanPublik);
  const [jenis, setJenis] = useState<JenisDokumen>('RPJM');
  const [page, setPage] = useState(1);

  const reload = () => stateDokumenPerencanaanPublik.load(jenis, page);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload dibuat ulang tiap render; dependensi sebenarnya jenis & page
  useEffect(() => { reload(); }, [jenis, page]);

  return (
    <>
      <section
        id={DOKUMEN_PERENCANAAN_SECTION_ID}
        className={`${apb.panel} ${r.docPanel}`}
        aria-labelledby={TITLE_ID}
      >
        <div className={s.panelHead}>
          <div>
            <h2 id={TITLE_ID} className={apb.panelTitle}>{MONEV_TEXT.docTitle}</h2>
            <p className={s.panelLead}>{MONEV_TEXT.docLead}</p>
          </div>
          <ScrollArea type="never" className={s.segScroll}>
            <SegmentedControl
              aria-label={MONEV_TEXT.docTabsLabel}
              radius="xl"
              data={tabOptions}
              value={jenis}
              onChange={(value) => { setJenis(value as JenisDokumen); setPage(1); }}
              classNames={{ root: s.segRoot }}
            />
          </ScrollArea>
        </div>
        <DokumenList
          jenis={jenis}
          items={state.data}
          loading={state.loading}
          failed={state.failed}
          onRetry={reload}
        />
      </section>
      <KabarListPagination
        total={state.totalPages}
        value={page}
        label={MONEV_TEXT.docPagination}
        onChange={setPage}
      />
    </>
  );
}

type ListProps = {
  jenis: JenisDokumen;
  items: readonly DokumenPerencanaanItem[];
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
};

/** Isi panel dokumen: memuat → kerangka, galat → coba lagi, kosong → pesan, berisi → baris. */
export function DokumenList({ jenis, items, loading, failed, onRetry }: ListProps) {
  if (loading) return <RowsSkeleton count={SKELETON_ROWS} label={MONEV_TEXT.docLoading} />;
  if (failed) return <MonevNotice message={MONEV_TEXT.docFailed} onRetry={onRetry} />;
  if (items.length === 0) return <p className={s.notice}>{MONEV_TEXT.docEmpty(jenis)}</p>;
  return (
    <ul className={r.rows}>
      {items.map((item) => <DokumenPerencanaanRow key={item.id} item={item} />)}
    </ul>
  );
}
