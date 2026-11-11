'use client';
import LayananWaktuBiayaBadge from '@/components/LayananWaktuBiayaBadge';
import { Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import BackButton from '../BackButto';
import { LAYANAN_BRAND_VARS, LAYANAN_LIST_HREF } from '../layanan.meta';
import page from '../layanan.module.css';
import { AjukanPermohonanModal } from './AjukanPermohonanModal';
import s from './layanan-detail.module.css';
import { LAYANAN_DETAIL_TEXT as T } from './layanan-detail.text';
import { useLayananDetail, type LayananDetailData } from './use-layanan-detail';

/** Halaman detail satu surat keterangan: judul, persyaratan, gambar alur, lalu tombol ajukan permohonan. */
export function LayananDetail({ id }: { id: string }) {
  const state = useLayananDetail(id);
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <div className={page.page} style={LAYANAN_BRAND_VARS}>
      <article className={s.wrap} aria-busy={state.status === 'loading' || undefined}>
        <BackButton />
        {state.status === 'loading' ? <DetailPlaceholder /> : null}
        {state.status === 'ready' ? <LayananDetailBody data={state.data} onAjukan={open} /> : null}
        {state.status === 'notfound' ? (
          <div className={page.empty}>
            <p className={s.emptyText}>{T.notFound}</p>
            <Link href={LAYANAN_LIST_HREF} className={s.emptyLink}>
              {T.backToList}
              <IconChevronRight size={16} stroke={2} aria-hidden />
            </Link>
          </div>
        ) : null}
      </article>
      <AjukanPermohonanModal opened={opened} onClose={close} />
    </div>
  );
}

/** Isi detail yang sudah dimuat: kategori, judul, tombol ajukan + badge, persyaratan, gambar alur, penutup. */
export function LayananDetailBody({ data, onAjukan }: { data: LayananDetailData; onAjukan: () => void }) {
  const ajukan = (
    <button type="button" className={s.cta} onClick={onAjukan} aria-haspopup="dialog">
      {T.ajukan}
    </button>
  );

  return (
    <>
      <header className={s.head}>
        <Link href={LAYANAN_LIST_HREF} className={s.kategori}>
          {T.kategori}
        </Link>
        <h1 className={s.title}>{data.name}</h1>
        <div className={s.actions}>
          {ajukan}
          <LayananWaktuBiayaBadge estimasiWaktu={data.estimasiWaktu} biaya={data.biaya} />
        </div>
      </header>

      {/* Persyaratan & alur dari editor admin (HTML tepercaya), sama seperti halaman sebelumnya. */}
      <div className={s.content} dangerouslySetInnerHTML={{ __html: data.deskripsi }} />

      {data.image2?.link ? (
        <figure className={s.figure}>
          <a href={data.image2.link} target="_blank" rel="noopener noreferrer" aria-label={T.alurLabel}>
            <Image src={data.image2.link} alt={T.alurAlt(data.name)} className={s.figureImg} />
          </a>
        </figure>
      ) : null}

      <section className={s.closing} aria-label={T.ajukan}>
        <div className={s.closingText}>
          <h2 className={s.closingTitle}>{T.closingTitle}</h2>
          <p>{T.closingText}</p>
        </div>
        {ajukan}
      </section>
    </>
  );
}

function DetailPlaceholder() {
  return (
    <div className={s.placeholder} aria-label={T.loading}>
      <span className={`${s.bar} ${s.barMeta}`} />
      <span className={`${s.bar} ${s.barTitle}`} />
      <span className={`${s.bar} ${s.barText}`} />
      <span className={`${s.bar} ${s.barFigure}`} />
    </div>
  );
}
