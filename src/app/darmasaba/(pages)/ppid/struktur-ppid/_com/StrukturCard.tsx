import { Image } from '@mantine/core';
import { IconUserFilled } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import type { OrgNode } from './struktur.logic';
import { strukturDetailHref } from './struktur.meta';
import s from './struktur-card.module.css';
import { STRUKTUR_TEXT } from './struktur.text';

type Props = { node: OrgNode; tone: 0 | 1 | 2; size: 'lg' | 'md' | 'sm' };

/**
 * Kartu satu jabatan: jabatan + pil nama di kiri, foto di kanan. Foto pegawai umumnya persegi berlatar
 * tidak transparan, jadi foto mengisi tinggi kartu dan tepi kirinya dipudarkan (mask) ke warna kartu.
 * Seluruh kartu = tautan ke profil; jabatan tanpa pegawai tampil redup tanpa tautan.
 */
export function StrukturCard({ node, tone, size }: Props) {
  const { person } = node;
  const body = (
    <>
      <div className={s.cardText}>
        <p className={s.role}>{node.title}</p>
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
      aria-label={`${person.name}, ${node.title} — ${STRUKTUR_TEXT.detailSuffix}`}
    >
      {body}
    </Link>
  );
}
