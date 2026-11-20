import { responsiveImageProps } from '@/app/(public)/_com/responsive-image.logic';
import type { LembagaKomunitasRecord } from '@/lib/lembaga-komunitas';
import { LembagaDeskripsi } from './LembagaDeskripsi';
import { kontakHref } from './lembaga-komunitas.logic';
import { LEMBAGA_KOMUNITAS_TEXT as T } from './lembaga-komunitas.text';
import s from './lembaga-komunitas.module.css';

/** Ukuran tampil foto menurut grid: 3 kolom desktop, 2 kolom tablet (≤1068px), 1 kolom ponsel (≤734px). */
export const LEMBAGA_FOTO_SIZES = '(max-width: 734px) 100vw, (max-width: 1068px) 50vw, 33vw';

/** Dimensi dasar foto (rasio 4:3, sama dengan CSS) supaya ruangnya tercadangkan sebelum gambar tiba (tanpa CLS). */
const FOTO_LEBAR = 480;
const FOTO_TINGGI = 360;

/** Satu kartu lembaga: foto (bila ada), nama, ketua, deskripsi ringkas, dan kontak (tautan tel:/mailto: bila bentuknya cocok). */
export function LembagaKomunitasKartu({ item }: { item: LembagaKomunitasRecord }) {
  const href = item.kontak ? kontakHref(item.kontak) : null;
  return (
    <li className={s.card}>
      {item.foto && (
        // eslint-disable-next-line @next/next/no-img-element -- foto MinIO via /api/img dengan srcSet sendiri (responsiveImageProps), pola situs memakai <img> lazy
        <img
          className={s.photo}
          {...responsiveImageProps(item.foto.link, LEMBAGA_FOTO_SIZES)}
          alt={T.fotoAlt(item.nama)}
          width={FOTO_LEBAR}
          height={FOTO_TINGGI}
          loading="lazy"
          decoding="async"
        />
      )}
      <div className={s.body}>
        <h3 className={s.nama}>{item.nama}</h3>
        {item.ketua && (
          <p className={s.meta}>
            <span className={s.label}>{T.ketuaLabel}</span> {item.ketua}
          </p>
        )}
        {item.deskripsi && <LembagaDeskripsi teks={item.deskripsi} />}
        {item.kontak && (
          <p className={s.meta}>
            <span className={s.label}>{T.kontakLabel}</span>{' '}
            {href ? <a className={s.kontak} href={href}>{item.kontak}</a> : item.kontak}
          </p>
        )}
      </div>
    </li>
  );
}
