'use client';
import { StrukturSearch } from '@/app/(public)/_com/struktur-organisasi/StrukturBody';
import { StrukturChart, StrukturChartSkeleton } from '@/app/(public)/_com/struktur-organisasi/StrukturChart';
import { STRUKTUR_TEXT } from '@/app/(public)/_com/struktur-organisasi/struktur.text';
import { useStrukturData, type StrukturData } from '@/app/(public)/_com/struktur-organisasi/use-struktur-data';
import { listSearchable } from '@/app/(public)/_com/kabar-list/kabar-list.logic';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { IconRefresh } from '@tabler/icons-react';
import { countPengurus, pengurusHref } from './bumdes.logic';
import { PENGURUS_ANCHOR } from './bumdes.meta';
import s from './bumdes.module.css';
import { strukturBumdesSource } from './bumdes.source';
import { BUMDES_TEXT } from './bumdes.text';

const T = BUMDES_TEXT.pengurus;
const TITLE_ID = 'bumdes-pengurus-title';
const VACANT = { showVacant: true } as const;

/**
 * Bagian "Struktur Pengurus": bagan bersama dengan SEMUA jabatan aktif, yang belum berpengurus sebagai
 * "Belum ditugaskan" (`showVacant`, hanya BUMDes). Kolom cari bila pengurus > 6; "Muat ulang" hanya saat galat.
 */
export function PengurusBumdes() {
  const data = useStrukturData(strukturBumdesSource, VACANT);
  const searchable = !data.loading && listSearchable(data.search.trim(), countPengurus(data.tree));

  return (
    <section id={PENGURUS_ANCHOR} className={s.block} aria-labelledby={TITLE_ID}>
      <h2 id={TITLE_ID} className={s.blockTitle}>
        {T.title}
      </h2>
      {searchable ? (
        <div className={s.search}>
          <StrukturSearch data={data} />
        </div>
      ) : null}
      <PengurusContent data={data} />
    </section>
  );
}

/** Isi bagan sesuai keadaan (diekspor untuk test). */
export function PengurusContent({ data }: { data: StrukturData }) {
  if (data.loading) return <StrukturChartSkeleton />;
  if (data.failed) {
    return (
      <div className={`${kabar.empty} ${s.emptyBox}`} role="alert">
        <p>{T.error}</p>
        <button type="button" className={s.retry} onClick={() => void data.reload()}>
          <IconRefresh size={16} stroke={2} aria-hidden />
          {T.reload}
        </button>
      </div>
    );
  }
  if (data.tree.length === 0) return <p className={kabar.empty}>{T.empty}</p>;
  if (data.visible.length === 0) {
    return (
      <p className={kabar.empty} role="status">
        {STRUKTUR_TEXT.noMatch(data.query.trim())}
      </p>
    );
  }
  return <StrukturChart roots={data.visible} label={T.chartLabel} hrefFor={pengurusHref} />;
}
