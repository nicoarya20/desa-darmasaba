import { Image } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import type { ReactNode } from 'react';
import { KontakActions } from './KontakActions';
import s from './kontak-darurat.module.css';
import type { PhoneInfo } from './kontak-phone.logic';

type Props = {
  name: string;
  phone: PhoneInfo | null;
  /** Ikon di ubin putih bila tanpa foto (mis. ikon kategori). */
  icon: ReactNode;
  photo?: string | null;
  description?: string;
  /** Nama menjadi tautan detail bila diisi; `linkLabel` = aria-label tautan. */
  href?: string;
  linkLabel?: string;
  /** Tingkat judul nama; h4 bila baris berada di bawah judul kelompok h3. */
  nameAs?: 'h3' | 'h4';
};

/** Satu baris kontak darurat (`<li>` di dalam `.panel`): foto/ikon, nama, deskripsi singkat, nomor + tombol. */
export function KontakRow({ name, phone, icon, photo, description, href, linkLabel, nameAs = 'h3' }: Props) {
  const Name = nameAs;
  return (
    <li className={s.row}>
      {photo ? (
        // Foto dekoratif: nama kontak sudah tertulis di sebelahnya.
        <Image src={photo} alt="" className={s.thumb} loading="lazy" decoding="async" />
      ) : (
        <span className={`${s.thumb} ${s.thumbFallback}`} aria-hidden>
          {icon}
        </span>
      )}
      <div className={s.body}>
        <Name className={s.name}>
          {href ? (
            <Link href={href} className={s.nameLink} aria-label={linkLabel}>
              {name}
              <IconChevronRight className={s.nameChevron} size={16} stroke={2} aria-hidden />
            </Link>
          ) : (
            name
          )}
        </Name>
        {description ? <p className={s.desc}>{description}</p> : null}
      </div>
      <KontakActions name={name} phone={phone} />
    </li>
  );
}

/** Kerangka abu berdenyut selama daftar dimuat. */
export function KontakRowPlaceholder() {
  return (
    <li className={s.row} aria-hidden>
      <span className={`${s.thumb} ${s.pulse}`} />
      <div className={s.body}>
        <span className={`${s.bar} ${s.pulse}`} />
        <span className={`${s.bar} ${s.barShort} ${s.pulse}`} />
      </div>
      <span className={`${s.bar} ${s.barCall} ${s.pulse}`} />
    </li>
  );
}
