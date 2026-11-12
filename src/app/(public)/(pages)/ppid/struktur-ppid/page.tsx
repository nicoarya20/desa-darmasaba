'use client'
import ScrollToTopButton from '@/app/(public)/_com/scrollToTopButton'
import { StrukturBody, StrukturSearch } from '@/app/(public)/_com/struktur-organisasi/StrukturBody'
import { STRUKTUR_VARS } from '@/app/(public)/_com/struktur-organisasi/struktur.meta'
import { useStrukturData } from '@/app/(public)/_com/struktur-organisasi/use-struktur-data'
import { PpidPage } from '../_com/PpidPage'
import { strukturDetailHref } from './_com/struktur-ppid.meta'
import { strukturPpidSource } from './_com/struktur-ppid.source'
import { STRUKTUR_PPID_TEXT as T } from './_com/struktur-ppid.text'

/** Halaman publik Struktur Organisasi PPID: bagan jabatan + pegawai aktif, bisa disaring. */
export default function Page() {
  const data = useStrukturData(strukturPpidSource)
  return (
    <PpidPage title={T.title} lead={T.lead} aside={<StrukturSearch data={data} />} style={STRUKTUR_VARS}>
      <StrukturBody data={data} label={T.chartLabel} emptyHint={T.emptyHint} hrefFor={strukturDetailHref} />
      <ScrollToTopButton />
    </PpidPage>
  )
}
