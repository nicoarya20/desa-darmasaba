'use client';
import { DokumentasiGaleri } from '@/app/(public)/(tambahan)/program-inovasi/[id]/_com/DokumentasiGaleri';
import { DetailBackLink } from '@/app/(public)/_com/detail-back-link/DetailBackLink';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import type { PengumumanDetail as Detail } from '@/lib/pengumuman-lampiran';
import { formatTanggalTerbit, tanggalPengumuman } from '@/lib/pengumuman-tanggal';
import { Image } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { pengumumanListHref } from '../pengumuman-list.logic';
import { PengumumanDokumenRows } from './PengumumanDokumenRows';
import s from './pengumuman-detail.module.css';
import { PENGUMUMAN_DETAIL_TEXT as T } from './pengumuman-detail.text';
import { usePengumumanDetail } from './use-pengumuman-detail';

/** Halaman detail pengumuman: kategori · tanggal, judul, gambar utama, isi, galeri, lampiran PDF. */
export function PengumumanDetail({ id }: { id: string }) {
  const state = usePengumumanDetail(id);

  return (
    <article className={kabar.section} aria-busy={state.status === 'loading' || undefined}>
      <div className={d.wrap}>
        <DetailBackLink href={pengumumanListHref('')} label={T.backLink} />
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {state.status === 'ready' ? <DetailBody data={state.data} /> : null}
        {state.status === 'notfound' || state.status === 'error' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{state.status === 'notfound' ? T.notFound : T.error}</p>
            <Link href={pengumumanListHref('')} className={`${d.emptyLink} ${r.trigger}`}>
              <span className={r.cta} data-text={T.backToList}>
                {T.backToList}
              </span>
              <IconChevronRight className={r.chevron} size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function DetailBody({ data }: { data: Detail }) {
  const kategori = data.CategoryPengumuman?.name?.trim();
  const tanggal = tanggalPengumuman(data);
  const galeri = data.images ?? [];
  const dokumen = (data.dokumen ?? []).filter((f) => !!f.link);

  return (
    <>
      <header className={d.head}>
        <p className={d.meta}>
          {kategori ? (
            <Link href={pengumumanListHref(kategori)} className={`${d.kategori} ${r.trigger}`}>
              <span className={r.cta} data-text={kategori}>
                {kategori}
              </span>
            </Link>
          ) : null}
          <time dateTime={tanggal.toISOString()}>{formatTanggalTerbit(tanggal)}</time>
        </p>
        <h1 className={d.title}>{data.judul}</h1>
      </header>

      {data.image?.link ? (
        <figure className={s.figure}>
          <a href={data.image.link} target="_blank" rel="noopener noreferrer" aria-label={T.gambarLabel} data-pengumuman-gambar-utama>
            <Image src={data.image.link} alt={data.judul} className={s.figureImg} />
          </a>
        </figure>
      ) : null}

      {/* Isi dari editor admin (HTML tepercaya), sama seperti halaman sebelumnya. */}
      <div className={`${d.content} ${rt.root}`} dangerouslySetInnerHTML={{ __html: data.content }} />

      {galeri.length > 0 ? (
        <section className={s.block} aria-label={T.galeri}>
          <h2 className={s.blockTitle}>{T.galeri}</h2>
          <DokumentasiGaleri images={galeri} judul={null} alt={T.galeriAlt} />
        </section>
      ) : null}

      {dokumen.length > 0 ? (
        <section className={s.block} aria-label={T.lampiran}>
          <h2 className={s.blockTitle}>{T.lampiran}</h2>
          <PengumumanDokumenRows dokumen={dokumen} label={T.lampiran} />
        </section>
      ) : null}
    </>
  );
}

function DetailPlaceholder() {
  return (
    <div className={d.placeholder} aria-label={T.loading}>
      <span className={`${d.bar} ${d.barMeta}`} />
      <span className={`${d.bar} ${d.barTitle}`} />
      <span className={`${d.bar} ${d.barTitleShort}`} />
      <span className={`${d.bar} ${d.barFigure}`} />
    </div>
  );
}
