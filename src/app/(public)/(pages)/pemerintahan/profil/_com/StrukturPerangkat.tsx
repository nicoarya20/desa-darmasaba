'use client'
import { useId } from 'react';
import { StrukturBody, StrukturSearch } from '@/app/(public)/_com/struktur-organisasi/StrukturBody';
import { useStrukturData } from '@/app/(public)/_com/struktur-organisasi/use-struktur-data';
import { ProfilHeading } from './ProfilCard';
import { strukturPerangkatHref } from './profil.meta';
import { STRUKTUR_PERANGKAT_TEXT as T } from './profil.text';
import { strukturPerangkatSource } from './struktur-perangkat.source';

/** Section Struktur Perangkat Desa di Profil Desa: bagan bersama Struktur PPID, tanpa kartu pembungkus. */
export function StrukturPerangkatSection() {
  const id = useId();
  const data = useStrukturData(strukturPerangkatSource);
  return (
    <section aria-labelledby={id}>
      <ProfilHeading id={id} title={T.title} lead={T.lead} aside={<StrukturSearch data={data} />} />
      <StrukturBody data={data} label={T.chartLabel} emptyHint={T.emptyHint} hrefFor={strukturPerangkatHref} />
    </section>
  );
}
