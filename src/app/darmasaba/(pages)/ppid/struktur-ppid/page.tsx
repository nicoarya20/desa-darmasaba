/* eslint-disable react-hooks/exhaustive-deps -- muat data sekali saat halaman dibuka */
'use client'
import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID'
import ScrollToTopButton from '@/app/darmasaba/_com/scrollToTopButton'
import colors from '@/con/colors'
import { Box, Button, Stack, Text } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { IconRefresh } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { useProxy } from 'valtio/utils'
import BackButton from '../../pemerintahan/layanan/_com/BackButto'
import { StrukturChart, StrukturChartSkeleton } from './_com/StrukturChart'
import { StrukturHeader } from './_com/StrukturHeader'
import { buildOrgTree, filterOrgTree, type PegawaiItem, type PosisiItem } from './_com/struktur.logic'
import { STRUKTUR_PEGAWAI_LIMIT, STRUKTUR_SEARCH_DEBOUNCE, STRUKTUR_VARS } from './_com/struktur.meta'
import { STRUKTUR_TEXT } from './_com/struktur.text'

/** Halaman publik Struktur Organisasi PPID: bagan jabatan + pegawai aktif, bisa disaring. */
export default function Page() {
  const pegawaiState = useProxy(stateStrukturPPID.pegawai)
  const posisiState = useProxy(stateStrukturPPID.posisiOrganisasi)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [query] = useDebouncedValue(search, STRUKTUR_SEARCH_DEBOUNCE)

  const load = async () => {
    setLoading(true)
    // Kedua loader menangkap galatnya sendiri (data jadi kosong) — allSettled hanya menunggu keduanya selesai.
    await Promise.allSettled([
      pegawaiState.findMany.load(1, STRUKTUR_PEGAWAI_LIMIT),
      // Daftar jabatan dipakai untuk menggambar jabatan induk yang belum punya pegawai.
      posisiState.findManyAll.load(),
    ])
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const pegawai = pegawaiState.findMany.data
  const posisi = posisiState.findManyAll.data
  const tree = useMemo(
    () => buildOrgTree((pegawai ?? []) as PegawaiItem[], (posisi ?? []) as PosisiItem[]),
    [pegawai, posisi],
  )
  const visible = useMemo(() => filterOrgTree(tree, query), [tree, query])

  let content
  if (loading) {
    content = <StrukturChartSkeleton />
  } else if (tree.length === 0) {
    content = (
      <Stack align="center" gap="xs" py={48}>
        <Text fz={{ base: 15, md: 17 }} fw={600} c="dimmed">{STRUKTUR_TEXT.empty}</Text>
        <Text fz={{ base: 13, md: 15 }} c="dimmed">{STRUKTUR_TEXT.emptyHint}</Text>
        <Button mt="sm" radius="xl" color={colors['blue-button']} leftSection={<IconRefresh size={16} />} onClick={() => void load()}>
          {STRUKTUR_TEXT.reload}
        </Button>
      </Stack>
    )
  } else if (visible.length === 0) {
    content = (
      <Text ta="center" py={48} fz={{ base: 15, md: 17 }} c="dimmed" role="status">
        {STRUKTUR_TEXT.noMatch(query.trim())}
      </Text>
    )
  } else {
    content = <StrukturChart roots={visible} />
  }

  return (
    <Stack bg={colors.Bg} py="xl" gap={48} mih="100vh" style={STRUKTUR_VARS}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Stack px={{ base: 'md', md: 100 }} gap={40}>
        <StrukturHeader search={search} onSearch={setSearch} />
        {content}
      </Stack>
      <ScrollToTopButton />
    </Stack>
  )
}
