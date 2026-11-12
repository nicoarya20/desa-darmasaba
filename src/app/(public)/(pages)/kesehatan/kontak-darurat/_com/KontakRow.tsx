import { Image } from '@mantine/core';
import { IconChevronRight, IconFirstAidKit } from '@tabler/icons-react';
import { Link } from 'next-view-transitions';
import { KontakActions } from './KontakActions';
import { phoneInfo, toPlainText, type KontakDarurat } from './kontak-darurat.logic';
import { kontakDetailHref } from './kontak-darurat.meta';
import s from './kontak-darurat.module.css';
import { KONTAK_TEXT as T } from './kontak-darurat.text';

/** Satu baris kontak: foto kecil (bila ada), nama = tautan detail, deskripsi singkat, nomor + tombol panggil. */
export function KontakRow({ item }: { item: KontakDarurat }) {
  const description = toPlainText(item.deskripsi);
  const photo = item.image?.link;

  return (
    <li className={s.row}>
      {photo ? (
        // Foto dekoratif: nama kontak sudah tertulis di sebelahnya.
        <Image src={photo} alt="" className={s.thumb} loading="lazy" decoding="async" />
      ) : (
        <span className={`${s.thumb} ${s.thumbFallback}`} aria-hidden>
          <IconFirstAidKit size={28} stroke={1.5} />
        </span>
      )}
      <div className={s.body}>
        <h3 className={s.name}>
          <Link href={kontakDetailHref(item.id)} className={s.nameLink} aria-label={T.detailLabel(item.name)}>
            {item.name}
            <IconChevronRight className={s.nameChevron} size={16} stroke={2} aria-hidden />
          </Link>
        </h3>
        {description ? <p className={s.desc}>{description}</p> : null}
      </div>
      <KontakActions name={item.name} phone={phoneInfo(item.whatsapp)} />
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
