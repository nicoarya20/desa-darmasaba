'use client'
import { useId } from 'react';
import { StrukturBody, StrukturSearch } from '../../../ppid/struktur-ppid/_com/StrukturBody';
import { useStrukturData } from '../../../ppid/struktur-ppid/_com/use-struktur-data';
import { ProfilHeading } from './ProfilCard';
import { strukturPerangkatHref } from './profil.meta';
import { STRUKTUR_PERANGKAT_TEXT as T } from './profil.text';

/** Section Struktur Perangkat Desa di Profil Desa: bagan yang sama dengan Struktur PPID, tanpa kartu pembungkus. */
export function StrukturPerangkatSection() {
  const id = useId();
  const data = useStrukturData();
  return (
    <section aria-labelledby={id}>
      <ProfilHeading id={id} title={T.title} lead={T.lead} aside={<StrukturSearch data={data} />} />
      <StrukturBody data={data} label={T.chartLabel} emptyHint={T.emptyHint} hrefFor={strukturPerangkatHref} />
    </section>
  );
}
