/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import potensiDesaState from '@/app/admin/(dashboard)/_state/desa/potensi';
import colors from '@/con/colors';
import { Box, Flex, Paper, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../layanan/_com/BackButto';
import { PotensiDetailModal } from './_com/PotensiDetailModal';
import { PotensiGrid } from './_com/PotensiGrid';
import { POTENSI_LIST_LIMIT, type PotensiItem } from './_com/potensi.logic';

function Page() {
  const [loading, setLoading] = useState(false)
  // Item dipertahankan saat overlay ditutup agar isinya tidak hilang selama animasi keluar.
  const [selected, setSelected] = useState<PotensiItem | null>(null)
  const [detailOpened, setDetailOpened] = useState(false)
  const state = useProxy(potensiDesaState)

  const openDetail = (item: PotensiItem) => {
    setSelected(item)
    setDetailOpened(true)
  }

  useEffect(() => {
    state.kategoriPotensi.findMany.load()
    const loadData = async () => {
      try {
        setLoading(true)
        await state.potensiDesa.findMany.load(1, POTENSI_LIST_LIMIT)
      } catch (error) {
        console.error('Gagal memuat data:', error);
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const data = state.potensiDesa.findMany.data
  // data null = belum pernah dimuat; tampilkan kerangka, bukan pesan kosong, sebelum efek pertama jalan.
  const isLoading = loading || data === null

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={48}>
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: "md", md: 100 }}>
        <Flex justify="space-between" align="center" direction={{ base: "column", md: "row" }} gap="lg">
          <Stack gap="sm" maw={600}>
            <Title order={1} fz={{ base: 28, md: 36 }} lh={1.2} c={colors["blue-button"]}>
              Potensi Desa Darmasaba
            </Title>
            <Text fz={{ base: 14, md: 16 }} lh={1.6} ta="justify">
              Temukan berbagai potensi unggulan, peluang, dan daya tarik yang menjadikan Desa Darmasaba istimewa.
            </Text>
          </Stack>
          <Paper
            radius="2xl"
            px="xl"
            py="md"
            bg={colors["blue-button"]}
            shadow="xl"
            withBorder
          >
            <Flex justify="center" align="center" gap="xl">
              <Box>
                <Text ta="center" fz={{ base: 20, md: 32 }} fw={800} c="white" lh={1.2}>
                  {data?.filter(item => item.kategori?.nama.toLowerCase() !== 'wisata').length || 0}
                </Text>
                <Text ta="center" fz={{ base: 12, md: 14 }} c="white" fw={500}>
                  Potensi
                </Text>
              </Box>
              <Box>
                <Text ta="center" fz={{ base: 20, md: 32 }} fw={800} c="white" lh={1.2}>
                  {data?.filter(item => item.kategori?.nama.toLowerCase() === 'wisata').length || 0}
                </Text>
                <Text ta="center" fz={{ base: 12, md: 14 }} c="white" fw={500}>
                  Wisata
                </Text>
              </Box>
            </Flex>
          </Paper>
        </Flex>

        {!isLoading && data.length === 0 ? (
          <Stack align="center" gap="xs" py={48}>
            <Text fz={{ base: 14, md: 16 }} fw={600} c="dimmed">
              Belum ada potensi desa
            </Text>
            <Text fz={{ base: 12, md: 14 }} c="dimmed">
              Data potensi akan tampil di sini setelah tersedia.
            </Text>
          </Stack>
        ) : (
          <PotensiGrid items={(data ?? []) as PotensiItem[]} loading={isLoading} onOpen={openDetail} />
        )}
      </Box>

      <PotensiDetailModal item={selected} opened={detailOpened} onClose={() => setDetailOpened(false)} />
    </Stack>
  );
}

export default Page;
