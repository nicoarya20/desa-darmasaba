/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import PendapatanAsliDesa from '@/app/admin/(dashboard)/_state/ekonomi/PADesa'
import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes'
import colors from '@/con/colors'
import { ActionIcon, Box, Center, Container, Group, Image, Loader, Select, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import { Link } from 'next-view-transitions'
import { useEffect, useState } from 'react'
import { useProxy } from 'valtio/utils'
import { toast } from 'react-toastify'
import BackButton from '../../(pages)/desa/layanan/_com/BackButto'
import APBDesTable from './lib/apbDesaTable'
import APBDesProgress from './lib/apbDesaProgress'
import { transformAPBDesData } from './lib/types'

function Page() {
  const state = useProxy(apbdes)
  const paDesaState = useProxy(PendapatanAsliDesa.ApbDesa)
  const [loading, setLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await state.findMany.load()
        await paDesaState.findMany.load()
      } catch (error) {
        console.error('Error loading APBDes data:', error)
        toast.error('Gagal memuat data APBDes')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const dataAPBDes = state.findMany.data || []

  // Buat daftar tahun unik dari data
  const years = Array.from(
    new Set(
      dataAPBDes
        .filter((item: any) => item?.tahun != null) // Filter out items with null/undefined tahun
        .map((item: any) => item.tahun)
    )
  )
    .sort((a, b) => b - a) // urutkan descending
    .map(year => ({ value: year.toString(), label: `Tahun ${year}` }))

  // Pilih tahun pertama sebagai default jika belum ada yang dipilih
  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(years[0].value)
    }
  }, [years, selectedYear])

  // Transform and filter data based on selected year
  let currentApbdes = null;
  if (dataAPBDes.length > 0 && selectedYear) {
    const selectedData = dataAPBDes.find((item: any) => item?.tahun?.toString() === selectedYear);
    if (selectedData) {
      currentApbdes = transformAPBDesData(selectedData);
    }
  } else if (dataAPBDes.length > 0 && !selectedYear && years.length > 0) {
    // If no year is selected but data exists, use the first item
    currentApbdes = transformAPBDesData(dataAPBDes[0]);
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={32}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Container w={{ base: '100%', md: '60%' }}>
        <Stack align="center" gap="sm">
          <Title order={1} fz={{ base: '2.4rem', md: '3.2rem' }} fw="bold" ta="center">
            Anggaran Pendapatan & Belanja Desa (APBDes)
          </Title>
          <Text fz="md" c="dimmed" ta="center">
            Laporan transparansi APBDes Desa Darmasaba sebagai bentuk keterbukaan dan akuntabilitas pengelolaan anggaran desa.
          </Text>
        </Stack>
      </Container>
      {loading ? (
        <Center mih={200}>
          <Stack align="center" gap="sm">
            <Loader size="lg" color="blue" />
            <Text fz="lg" c="dimmed">Sedang memuat data APBDes...</Text>
          </Stack>
        </Center>
      ) : dataAPBDes.length === 0 ? (
        <Center mih={200}>
          <Stack align="center" gap="xs">
            <Text fz="xl" fw={600} c="dimmed">Belum ada data APBDes tersedia</Text>
            <Text fz="sm" c="dimmed">Data akan ditampilkan jika sudah diunggah oleh admin desa</Text>
          </Stack>
        </Center>
      ) : (
        <SimpleGrid px={{ base: 'md', md: 100 }} cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
          {dataAPBDes.map((v: any, k: number) => (
            <Box key={k} pos="relative" h={360} style={{ borderRadius: 27, overflow: "hidden" }}>
              <Image
                src={v.image?.link || ''}
                alt={v.name}
                pos="absolute"
                top={0}
                left={0}
                w="100%"
                h="100%"
                fit="cover"
                loading="eager"
                style={{ zIndex: 0, borderRadius: 27 }}
              />
              <Box pos="absolute" inset={0} bg="rgba(0,0,0,0.45)" style={{ borderRadius: 27, zIndex: 1 }} />
              <Stack justify="space-between" h="100%" p="lg" pos="relative" style={{ zIndex: 2 }}>
                <Box>
                  <Text fz="lg" fw={600} c="white" ta="center">
                    {v.name}
                  </Text>
                </Box>
                <Text fz="2.6rem" fw="bold" c="white" ta="center">
                  {v.jumlah}
                </Text>
                <Group justify="center">
                  <ActionIcon
                    component={Link}
                    href={v.file?.link || '#'}
                    radius="xl"
                    size="lg"
                    bg={colors['blue-button']}
                    variant="filled"
                  >
                    <IconDownload size={20} color="white" />
                  </ActionIcon>
                </Group>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      )}
      {/* 🔥 COMBOBOX UNTUK PILIH TAHUN */}
      <Box px={{ base: 'md', md: 100 }}>
        <Select
          label="Pilih Tahun APBDes"
          placeholder="Pilih tahun"
          value={selectedYear}
          onChange={setSelectedYear}
          data={years}
          w={{ base: '100%', sm: 200 }}
          searchable
          clearable
          nothingFoundMessage="Tidak ada tahun tersedia"
        />
      </Box>
      {/* ❗ Pass currentApbdes ke komponen anak */}
      {currentApbdes ? (
        <>
          <APBDesTable apbdesData={currentApbdes} />
          <APBDesProgress apbdesData={currentApbdes} />
        </>
      ) : (
        <Box px={{ base: 'md', md: 100 }} py="md">
          <Text c="dimmed">Tidak ada data APBDes untuk tahun yang dipilih.</Text>
        </Box>
      )}
    </Stack>
  )
}

export default Page