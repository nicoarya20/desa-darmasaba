import colors from '@/con/colors'
import { Button, Stack, Text } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import { SearchField } from '../search-field/SearchField'
import { StrukturChart, StrukturChartSkeleton, type StrukturLayout } from './StrukturChart'
import { STRUKTUR_TEXT } from './struktur.text'
import type { StrukturData } from './use-struktur-data'

/** Kotak cari nama/jabatan di atas bagan. */
export function StrukturSearch({ data }: { data: StrukturData }) {
  return (
    <SearchField
      fullWidth
      label={STRUKTUR_TEXT.searchLabel}
      placeholder={STRUKTUR_TEXT.searchPlaceholder}
      value={data.search}
      onChange={data.setSearch}
    />
  )
}

type Props = {
  data: StrukturData
  /** Nama bagan untuk pembaca layar. */
  label: string
  /** Kalimat kedua saat belum ada pegawai aktif (konteks halaman). */
  emptyHint: string
  hrefFor: (pegawaiId: string) => string
  /** Tata letak bagan (lihat `StrukturChart`); bawaan pohon. */
  layout?: StrukturLayout
}

/** Isi bagan sesuai keadaan: kerangka saat memuat, kosong + muat ulang, tidak ada yang cocok, atau bagan. */
export function StrukturBody({ data, label, emptyHint, hrefFor, layout }: Props) {
  if (data.loading) return <StrukturChartSkeleton />
  if (data.tree.length === 0) {
    return (
      <Stack align="center" gap="xs" py={48}>
        <Text fz={{ base: 15, md: 17 }} fw={600} c="dimmed">{STRUKTUR_TEXT.empty}</Text>
        <Text fz={{ base: 13, md: 15 }} c="dimmed">{emptyHint}</Text>
        <Button mt="sm" radius="xl" color={colors['blue-button']} leftSection={<IconRefresh size={16} />} onClick={() => void data.reload()}>
          {STRUKTUR_TEXT.reload}
        </Button>
      </Stack>
    )
  }
  if (data.visible.length === 0) {
    return (
      <Text ta="center" py={48} fz={{ base: 15, md: 17 }} c="dimmed" role="status">
        {STRUKTUR_TEXT.noMatch(data.query.trim())}
      </Text>
    )
  }
  return <StrukturChart roots={data.visible} label={label} hrefFor={hrefFor} layout={layout} />
}
