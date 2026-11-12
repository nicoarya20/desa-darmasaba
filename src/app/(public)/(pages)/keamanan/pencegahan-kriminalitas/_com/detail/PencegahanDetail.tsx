'use client';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import { htmlToText } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { formatTanggalTerbit } from '@/lib/tanggal-terbit';
import { IconArrowUpRight, IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { externalVideoHref, pencegahanListHref, youtubeId, type PencegahanApiItem } from '../pencegahan.logic';
import { PENCEGAHAN_DETAIL_TEXT as T } from '../pencegahan.text';
import { VideoFacade } from '../VideoFacade';
import s from './pencegahan-detail.module.css';
import { usePencegahanDetail } from './use-pencegahan-detail';

/** Halaman detail program: kembali, kategori · tanggal, judul, ringkasan, video, lalu isi. */
export function PencegahanDetail({ id }: { id: string }) {
  const state = usePencegahanDetail(id);

  return (
    <article className={kabar.section} style={KABAR_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={d.wrap}>
        <BackButton />
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {state.status === 'ready' ? <PencegahanDetailBody data={state.data} /> : null}
        {state.status === 'notfound' || state.status === 'error' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{state.status === 'notfound' ? T.notFound : T.error}</p>
            <Link href={pencegahanListHref()} className={d.emptyLink}>
              {T.backToList}
              <IconChevronRight size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Isi detail yang sudah dimuat (diekspor untuk test). Bagian kosong tidak dirender. */
export function PencegahanDetailBody({ data }: { data: PencegahanApiItem }) {
  const dibuat = new Date(data.createdAt);
  const ringkasan = htmlToText(data.deskripsiSingkat);
  const videoId = youtubeId(data.linkVideo);
  const videoHref = externalVideoHref(data.linkVideo);

  return (
    <>
      <header className={d.head}>
        <p className={d.meta}>
          <Link href={pencegahanListHref()} className={d.kategori}>
            {T.kategori}
          </Link>
          <time dateTime={dibuat.toISOString()}>{formatTanggalTerbit(dibuat)}</time>
        </p>
        <h1 className={d.title}>{data.judul}</h1>
        {ringkasan ? <p className={s.lead}>{ringkasan}</p> : null}
      </header>

      {videoId ? <VideoFacade videoId={videoId} title={data.judul} /> : null}
      {videoHref ? (
        <a href={videoHref} target="_blank" rel="noopener noreferrer" className={s.videoLink}>
          {T.bukaVideo}
          <IconArrowUpRight size={16} stroke={2} aria-hidden />
        </a>
      ) : null}

      {/* Isi dari editor admin (HTML tepercaya), sama seperti halaman sebelumnya. */}
      {data.deskripsi ? <div className={d.content} dangerouslySetInnerHTML={{ __html: data.deskripsi }} /> : null}
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
