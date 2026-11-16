import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import GaleriFoto from '@/app/(public)/_com/konten-bersama/galeri-foto.grid';
import StrukturPengurusView from '@/app/(public)/_com/konten-bersama/struktur-pengurus.view';
import type { PustuDetail } from '@/lib/pustu/pustu.types';
import { sanitizeRichText } from '@/lib/rich-text';
import { Image } from '@mantine/core';
import type { ReactNode } from 'react';
import { PUSTU_TEXT as T } from '../pustu.text';
import s from '../pustu.module.css';
import PustuInfo from './PustuInfo';
import { LayananUnggulanGrid, TarifGrid } from './PustuLayananTarif';

function Blok({ id, judul, children }: { id: string; judul: string; children: ReactNode }) {
  return (
    <section className={s.block} aria-labelledby={id} data-testid={id}>
      <h2 id={id} className={s.blockTitle}>
        {judul}
      </h2>
      {children}
    </section>
  );
}

/**
 * Isi detail PUSTU (tanpa memuat data, bisa dites): nama, foto lokasi, info (alamat, jam, kontak, darurat),
 * layanan unggulan, prosedur, tarif BPJS vs umum, struktur, galeri. Bagian tanpa isi disembunyikan.
 */
export default function PustuDetailBody({ data }: { data: PustuDetail }) {
  const prosedur = sanitizeRichText(data.prosedurPendaftaran);
  const tarifBpjs = sanitizeRichText(data.tarifBpjs);
  const tarifUmum = sanitizeRichText(data.tarifUmum);
  const adaStruktur = data.fotoBaganStruktur !== null || data.pengurus.length > 0;

  return (
    <>
      <header className={d.head}>
        <p className={`${d.meta} ${d.kategori}`}>{T.judul}</p>
        <h1 className={d.title}>{data.name}</h1>
      </header>

      {data.image?.link ? (
        <figure className={d.photo}>
          <a href={data.image.link} target="_blank" rel="noopener noreferrer" aria-label={T.fotoLabel(data.name)}>
            <Image src={data.image.link} alt={data.name} className={d.photoImg} />
          </a>
        </figure>
      ) : null}

      <PustuInfo data={data} />

      {data.layananUnggulan.length > 0 ? (
        <Blok id="pustu-blok-layanan" judul={T.layanan}>
          <LayananUnggulanGrid items={data.layananUnggulan} />
        </Blok>
      ) : null}
      {prosedur ? (
        <Blok id="pustu-blok-prosedur" judul={T.prosedur}>
          <div className={d.content} dangerouslySetInnerHTML={{ __html: prosedur }} />
        </Blok>
      ) : null}
      {tarifBpjs || tarifUmum ? (
        <Blok id="pustu-blok-tarif" judul={T.tarif}>
          <TarifGrid bpjs={tarifBpjs} umum={tarifUmum} />
        </Blok>
      ) : null}
      {adaStruktur ? (
        <Blok id="pustu-blok-struktur" judul={T.struktur}>
          <StrukturPengurusView bagan={data.fotoBaganStruktur} pengurus={data.pengurus} namaPemilik={data.name} />
        </Blok>
      ) : null}
      {data.fotoKegiatan.length > 0 ? (
        <Blok id="pustu-blok-galeri" judul={T.galeri}>
          <GaleriFoto foto={data.fotoKegiatan} namaPemilik={data.name} judul={null} ariaLabel={T.galeri} testId="galeri-pustu" />
        </Blok>
      ) : null}
    </>
  );
}
