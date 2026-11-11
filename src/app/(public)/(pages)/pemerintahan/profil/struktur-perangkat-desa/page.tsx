'use client'
import ScrollToTopButton from '@/app/(public)/_com/scrollToTopButton'
import { PpidPage } from '../../../ppid/_com/PpidPage'
import { StrukturBody, StrukturSearch } from '../../../ppid/struktur-ppid/_com/StrukturBody'
import { STRUKTUR_VARS } from '../../../ppid/struktur-ppid/_com/struktur.meta'
import { useStrukturData } from '../../../ppid/struktur-ppid/_com/use-struktur-data'
import { strukturPerangkatHref } from '../_com/profil.meta'
import { STRUKTUR_PERANGKAT_TEXT as T } from '../_com/profil.text'

/** Halaman publik Struktur Perangkat Desa: bagan yang sama dengan Struktur PPID (kepala halaman + cari + bagan). */
export default function Page() {
  const data = useStrukturData()
  return (
    <PpidPage title={T.title} lead={T.lead} aside={<StrukturSearch data={data} />} style={STRUKTUR_VARS}>
      <StrukturBody data={data} label={T.chartLabel} emptyHint={T.emptyHint} hrefFor={strukturPerangkatHref} />
      <ScrollToTopButton />
    </PpidPage>
  )
}
