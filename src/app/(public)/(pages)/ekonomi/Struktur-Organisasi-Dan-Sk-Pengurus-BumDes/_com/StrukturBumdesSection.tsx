'use client'
import { StrukturBody, StrukturSearch } from '@/app/(public)/_com/struktur-organisasi/StrukturBody'
import { useStrukturData } from '@/app/(public)/_com/struktur-organisasi/use-struktur-data'
import { Box } from '@mantine/core'
import BumdesSection from './BumdesSection'
import { strukturBumdesHref } from './struktur-bumdes.meta'
import { strukturBumdesSource } from './struktur-bumdes.source'
import { STRUKTUR_BUMDES_TEXT as T } from './struktur-bumdes.text'

/** Section Struktur Pengurus BUMDes: cari nama/jabatan + bagan bersama (kartu menuju profil pengurus). */
export default function StrukturBumdesSection() {
  const data = useStrukturData(strukturBumdesSource)
  return (
    <BumdesSection title={T.title}>
      <Box w="100%" maw={420} mx="auto">
        <StrukturSearch data={data} />
      </Box>
      <StrukturBody data={data} label={T.chartLabel} emptyHint={T.emptyHint} hrefFor={strukturBumdesHref} />
    </BumdesSection>
  )
}
