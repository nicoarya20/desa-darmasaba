import { Image } from '@mantine/core';
import { IconUserFilled } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import type { OrgCardItem } from './struktur.logic';
import { strukturDetailHref } from './struktur.meta';
import s from './struktur-card.module.css';
import { STRUKTUR_TEXT } from './struktur.text';

type Props = { item: OrgCardItem; tone: 0 | 1 | 2; size: 'lg' | 'md' | 'sm' };

/**
 * Kartu satu pegawai di satu jabatan: jabatan + pil nama di kiri, foto di kanan. Foto pegawai umumnya persegi berlatar
 * tidak transparan, jadi foto mengisi tinggi kartu dan tepi kirinya dipudarkan (mask) ke warna kartu.
 * Seluruh kartu = tautan ke profil; jabatan tanpa pegawai tampil redup tanpa tautan.
 */
export function StrukturCard({ item, tone, size }: Props) {
  const { person, title } = item;
  const body = (
    <>
      <div className={s.cardText}>
        <p className={s.role}>{title}</p>
        <p className={s.name}>{person?.name ?? STRUKTUR_TEXT.vacant}</p>
      </div>
      <div className={s.photo} aria-hidden>
        {person?.image ? (
          <Image src={person.image} alt="" className={s.photoImage} loading="lazy" decoding="async" />
        ) : (
          <IconUserFilled className={s.silhouette} />
        )}
      </div>
    </>
  );

  if (!person) {
    return (
      <div className={s.card} data-tone={tone} data-size={size} data-vacant>
        {body}
      </div>
    );
  }
  return (
    <Link
      href={strukturDetailHref(person.id)}
      className={s.card}
      data-tone={tone}
      data-size={size}
      aria-label={`${person.name}, ${title} — ${STRUKTUR_TEXT.detailSuffix}`}
    >
      {body}
    </Link>
  );
}
