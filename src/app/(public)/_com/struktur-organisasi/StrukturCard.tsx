import { Image } from '@mantine/core';
import { IconUserFilled } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { initialsOf } from './struktur-person.logic';
import type { OrgCardItem } from './struktur.logic';
import s from './struktur-card.module.css';
import { STRUKTUR_TEXT } from './struktur.text';

type Props = {
  item: OrgCardItem;
  tone: 0 | 1 | 2;
  /** `xs` = kartu ringkas bagan bertingkat: jabatan di atas, foto kecil + nama di bawah, tinggi menyesuaikan isi. */
  size: 'lg' | 'md' | 'sm' | 'xs';
  /** Rute profil pegawai — tiap halaman bagan punya rute detailnya sendiri. */
  hrefFor: (pegawaiId: string) => string;
  /** Nama tidak dipotong 2 baris; kartu memanjang bila perlu (kartu akar bagan bertingkat di layar sempit). */
  fullName?: boolean;
};

/**
 * Kartu satu pegawai di satu jabatan: jabatan + pil nama di kiri, foto di kanan. Foto pegawai umumnya persegi berlatar
 * tidak transparan, jadi foto mengisi tinggi kartu dan tepi kirinya dipudarkan (mask) ke warna kartu.
 * Pegawai tanpa foto → lingkaran inisial nama. Seluruh kartu = tautan ke profil; jabatan tanpa pegawai tampil redup
 * tanpa tautan (siluet).
 */
export function StrukturCard({ item, tone, size, hrefFor, fullName }: Props) {
  const { person, title } = item;
  const body = (
    <>
      <div className={s.cardText}>
        <p className={s.role}>{title}</p>
        <p className={s.name}>{person?.name ?? STRUKTUR_TEXT.vacant}</p>
      </div>
      <div className={s.photo} aria-hidden data-initials={(person && !person.image) || undefined}>
        {person?.image ? (
          <Image src={person.image} alt="" className={s.photoImage} loading="lazy" decoding="async" />
        ) : person ? (
          <span className={s.initials}>{initialsOf(person.name)}</span>
        ) : (
          <IconUserFilled className={s.silhouette} />
        )}
      </div>
    </>
  );

  if (!person) {
    return (
      <div className={s.card} data-tone={tone} data-size={size} data-full-name={fullName || undefined} data-vacant>
        {body}
      </div>
    );
  }
  return (
    <Link
      href={hrefFor(person.id)}
      className={s.card}
      data-tone={tone}
      data-size={size}
      data-full-name={fullName || undefined}
      aria-label={`${person.name}, ${title} — ${STRUKTUR_TEXT.detailSuffix}`}
    >
      {body}
    </Link>
  );
}
