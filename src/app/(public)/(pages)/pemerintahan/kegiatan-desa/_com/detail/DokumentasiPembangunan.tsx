import { DokumentasiGaleri } from '@/app/(public)/(tambahan)/program-inovasi/[id]/_com/DokumentasiGaleri';
import { susunanFotoPublik, type FotoPublik } from '@/lib/kegiatan-pembangunan-foto';
import s from './kegiatan-detail.module.css';
import { KEGIATAN_DETAIL_TEXT as T } from './kegiatan-detail.text';

type Props = {
  judul: string;
  fotoSebelum?: FotoPublik[] | null;
  fotoSesudah?: FotoPublik[] | null;
};

/** Blok "Dokumentasi Pembangunan": kolom Sebelum dan Sesudah berdampingan (maks 5 foto per kolom); kelompok kosong tidak tampil. */
export default function DokumentasiPembangunan({ judul, fotoSebelum, fotoSesudah }: Props) {
  const { kelompok, adaFoto } = susunanFotoPublik({ fotoSebelum, fotoSesudah });
  if (!adaFoto) return null;

  return (
    <section className={s.block} aria-label={T.dokumentasi} data-kegiatan-dokumentasi>
      <h2 className={s.blockTitle}>{T.dokumentasi}</h2>
      <div className={kelompok.length > 1 ? s.pair : s.pairSingle} data-dokumentasi-pasangan>
        {kelompok.map(({ kunci, files }) => (
          <div key={kunci} className={s.pairItem} data-dokumentasi-foto={kunci}>
            <h3 className={s.pairLabel}>{T.labelFoto[kunci]}</h3>
            <DokumentasiGaleri images={files} judul={null} alt={T.altFoto[kunci](judul)} />
          </div>
        ))}
      </div>
    </section>
  );
}
