'use client';
import BackButton from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import { htmlToText } from '@/app/(public)/_com/main-page/kabar-desa/kabar.logic';
import { KABAR_BRAND_VARS } from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { formatTanggalTerbit } from '@/lib/tanggal-terbit';
import { Image } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { formatPersen, isIndikator, programListHref, type ProgramApiItem } from '../program.logic';
import { PROGRAM_DETAIL_TEXT as T } from '../program.text';
import s from './program-detail.module.css';
import { useProgramDetail } from './use-program-detail';

/** Halaman detail program kesehatan: kembali, tanggal, judul, ringkasan, angka indikator atau foto, lalu isi. */
export function ProgramDetail({ id }: { id: string }) {
  const state = useProgramDetail(id);

  return (
    <article className={kabar.section} style={KABAR_BRAND_VARS} aria-busy={state.status === 'loading' || undefined}>
      <div className={d.wrap}>
        <BackButton />
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {state.status === 'ready' ? <ProgramDetailBody data={state.data} /> : null}
        {state.status === 'notfound' || state.status === 'error' ? (
          <div className={kabar.empty}>
            <p className={d.emptyText}>{state.status === 'notfound' ? T.notFound : T.error}</p>
            <Link href={programListHref()} className={d.emptyLink}>
              {T.backToList}
              <IconChevronRight size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Isi detail yang sudah dimuat (diekspor untuk test). Kegiatan → foto. Indikator tidak lagi ditautkan dari daftar,
 * tapi URL lamanya tetap bisa dibuka (tautan tersimpan): tampil panel angka persen, karena tanpa angka itu teks
 * "Persentase balita …" tidak bermakna.
 */
export function ProgramDetailBody({ data }: { data: ProgramApiItem }) {
  const dibuat = new Date(data.createdAt);
  const ringkasan = htmlToText(data.deskripsiSingkat);
  const indikator = isIndikator(data);
  const diperbarui = data.updatedAt ? new Date(data.updatedAt) : null;

  return (
    <>
      <header className={d.head}>
        <p className={d.meta}>
          {/* Indikator: tanggal dibuat (seed) tidak bermakna; tanggal pembaruan ditulis di panel angka. */}
          {indikator ? (
            <span className={d.kategori}>{T.indikator}</span>
          ) : (
            <time dateTime={dibuat.toISOString()}>{formatTanggalTerbit(dibuat)}</time>
          )}
        </p>
        <h1 className={d.title}>{data.name}</h1>
        {ringkasan ? <p className={s.lead}>{ringkasan}</p> : null}
      </header>

      {indikator ? (
        <div className={s.figure} data-program-indikator>
          <span className={s.figureValue}>{formatPersen(data.persentase ?? 0)}</span>
          {diperbarui ? <span className={s.figureNote}>{T.diperbarui(formatTanggalTerbit(diperbarui, false))}</span> : null}
        </div>
      ) : null}

      {data.image?.link ? (
        <figure className={d.photo}>
          <a href={data.image.link} target="_blank" rel="noopener noreferrer" aria-label={T.fotoLabel}>
            <Image src={data.image.link} alt={data.name} className={d.photoImg} />
          </a>
        </figure>
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
