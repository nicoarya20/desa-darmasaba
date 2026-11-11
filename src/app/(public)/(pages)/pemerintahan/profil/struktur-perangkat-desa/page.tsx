'use client'
import ScrollToTopButton from '@/app/(public)/_com/scrollToTopButton'
import { PpidPage } from '../../../ppid/_com/PpidPage'
import { StrukturBody, StrukturSearch } from '@/app/(public)/_com/struktur-organisasi/StrukturBody'
import { STRUKTUR_VARS } from '@/app/(public)/_com/struktur-organisasi/struktur.meta'
import { useStrukturData } from '@/app/(public)/_com/struktur-organisasi/use-struktur-data'
import { strukturPerangkatHref } from '../_com/profil.meta'
import { STRUKTUR_PERANGKAT_TEXT as T } from '../_com/profil.text'
import { strukturPerangkatSource } from '../_com/struktur-perangkat.source'

/** Halaman publik Struktur Perangkat Desa: bagan bersama Struktur PPID (kepala halaman + cari + bagan). */
export default function Page() {
  const data = useStrukturData(strukturPerangkatSource)
  return (
    <PpidPage title={T.title} lead={T.lead} aside={<StrukturSearch data={data} />} style={STRUKTUR_VARS}>
      <StrukturBody data={data} label={T.chartLabel} emptyHint={T.emptyHint} hrefFor={strukturPerangkatHref} />
      <ScrollToTopButton />
    </PpidPage>
  )
}
