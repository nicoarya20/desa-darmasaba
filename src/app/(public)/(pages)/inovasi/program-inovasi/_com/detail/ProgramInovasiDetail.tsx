import back from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.module.css';
import { DokumentasiGaleri, type GambarDokumentasi } from '@/app/(public)/(tambahan)/program-inovasi/[id]/_com/DokumentasiGaleri';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import { Image } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { programInovasiListHref } from '../program-inovasi.logic';
import { PROGRAM_INOVASI_DETAIL_TEXT as T } from '../program-inovasi.text';
import s from './program-inovasi-detail.module.css';

/** Data detail siap tampil; `html` sudah disanitasi di server (`sanitizeArticleHtml`). */
export type ProgramInovasiDetailView = {
  name: string;
  logo: string | null;
  html: string;
  photos: GambarDokumentasi[];
};

/**
 * Halaman detail Program Inovasi (dirender di server, isi ikut HTML pertama untuk mesin pencari):
 * "‹ Program Inovasi", kategori, logo, judul, isi editor admin, lalu galeri dokumentasi bila ada.
 */
export function ProgramInovasiDetail({ data }: { data: ProgramInovasiDetailView }) {
  return (
    <article className={kabar.section}>
      <div className={d.wrap}>
        <Link href={programInovasiListHref()} className={`${back.back} ${r.trigger}`}>
          <IconChevronLeft className={r.chevronBack} size={16} stroke={2} aria-hidden />
          <span className={r.cta} data-text={T.kembali}>
            {T.kembali}
          </span>
        </Link>

        <header className={d.head}>
          {data.logo ? (
            <span className={s.logo}>
              <Image className={s.logoImg} src={data.logo} alt={T.logoAlt(data.name)} fit="contain" />
            </span>
          ) : null}
          <p className={d.meta}>
            <span className={d.kategori}>{T.kategori}</span>
          </p>
          <h1 className={d.title}>{data.name}</h1>
        </header>

        {data.html ? (
          <div className={`${d.content} ${s.content} ${rt.root}`} dangerouslySetInnerHTML={{ __html: data.html }} />
        ) : (
          <p className={s.empty}>{T.emptyDescription}</p>
        )}

        <DokumentasiGaleri images={data.photos} judul={T.galleryTitle} alt={T.galleryAlt(data.name)} />
      </div>
    </article>
  );
}
