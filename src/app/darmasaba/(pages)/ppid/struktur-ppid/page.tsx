'use client'
import ScrollToTopButton from '@/app/darmasaba/_com/scrollToTopButton'
import { PpidPage } from '../_com/PpidPage'
import { StrukturBody, StrukturSearch } from './_com/StrukturBody'
import { STRUKTUR_VARS, strukturDetailHref } from './_com/struktur.meta'
import { STRUKTUR_TEXT } from './_com/struktur.text'
import { useStrukturData } from './_com/use-struktur-data'

/** Halaman publik Struktur Organisasi PPID: bagan jabatan + pegawai aktif, bisa disaring. */
export default function Page() {
  const data = useStrukturData()
  return (
    <PpidPage title={STRUKTUR_TEXT.title} lead={STRUKTUR_TEXT.lead} aside={<StrukturSearch data={data} />} style={STRUKTUR_VARS}>
      <StrukturBody data={data} label={STRUKTUR_TEXT.chartLabel} emptyHint={STRUKTUR_TEXT.emptyHint} hrefFor={strukturDetailHref} />
      <ScrollToTopButton />
    </PpidPage>
  )
}
