import { DokumentasiGaleri } from '@/app/(public)/(tambahan)/program-inovasi/[id]/_com/DokumentasiGaleri';
import { susunanFotoPublik, type FotoPublik } from '@/lib/kegiatan-pembangunan-foto';
import { Image } from '@mantine/core';
import s from './kegiatan-detail.module.css';
import { KEGIATAN_DETAIL_TEXT as T } from './kegiatan-detail.text';

type Props = {
  judul: string;
  fotoSebelum?: FotoPublik | null;
  fotoSesudah?: FotoPublik | null;
  fotoProgres?: FotoPublik[] | null;
};

/** Blok "Dokumentasi Pembangunan": foto sebelum/sesudah berdampingan + galeri progres; tidak dirender bila tanpa foto. */
export default function DokumentasiPembangunan({ judul, fotoSebelum, fotoSesudah, fotoProgres }: Props) {
  const { pasangan, galeri, adaFoto } = susunanFotoPublik({ fotoSebelum, fotoSesudah, fotoProgres });
  if (!adaFoto) return null;

  return (
    <section className={s.block} aria-label={T.dokumentasi} data-kegiatan-dokumentasi>
      <h2 className={s.blockTitle}>{T.dokumentasi}</h2>

      {pasangan.length > 0 ? (
        <div className={pasangan.length > 1 ? s.pair : s.pairSingle} data-dokumentasi-pasangan>
          {pasangan.map(({ kunci, file }) => (
            <figure key={kunci} className={s.pairItem} data-dokumentasi-foto={kunci}>
              <figcaption className={s.pairLabel}>{T.labelFoto[kunci]}</figcaption>
              <a href={file.link} target="_blank" rel="noopener noreferrer" aria-label={T.fotoLabelNamed(T.labelFoto[kunci])}>
                <Image src={file.link} alt={T.altFoto[kunci](judul)} className={s.pairImg} loading="lazy" />
              </a>
            </figure>
          ))}
        </div>
      ) : null}

      {galeri.length > 0 ? (
        <div className={s.progres} data-dokumentasi-progres>
          <h3 className={s.progresTitle}>{T.progres}</h3>
          <DokumentasiGaleri images={galeri} judul={null} alt={T.altProgres(judul)} />
        </div>
      ) : null}
    </section>
  );
}
