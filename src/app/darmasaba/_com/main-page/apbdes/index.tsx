/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import apbdes from '@/app/admin/(dashboard)/_state/landing-page/apbdes'
import APBDesProgress from '@/app/darmasaba/(tambahan)/apbdes/lib/apbDesaProgress'
import { transformAPBDesData } from '@/app/darmasaba/(tambahan)/apbdes/lib/types'
import colors from '@/con/colors'
import {
  ActionIcon,
  BackgroundImage,
  Box,
  Button,
  Center,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useProxy } from 'valtio/utils'

function Apbdes() {
  const state = useProxy(apbdes)
  const [loading, setLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)

  const textHeading = {
    title: 'APBDes',
    des: 'Transparansi APBDes Darmasaba adalah langkah nyata menuju tata kelola desa yang bersih, terbuka, dan bertanggung jawab.'
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await state.findMany.load()
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const dataAPBDes = state.findMany.data || []

  const years = Array.from(new Set(dataAPBDes.map((item: any) => item.tahun)))
    .sort((a, b) => b - a)
    .map(year => ({ value: year.toString(), label: `Tahun ${year}` }))

  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(years[0].value)
    }
  }, [years, selectedYear])

  const currentApbdes = dataAPBDes.length > 0
    ? transformAPBDesData(dataAPBDes.find(item => item?.tahun?.toString() === selectedYear) || dataAPBDes[0])
    : null

  const data = (state.findMany.data || []).slice(0, 3)

  return (
    <Stack p="sm" gap="xl" bg={colors.Bg}>
      {/* 📌 HEADING */}
      <Box mt="xl">
        <Stack gap="sm">
          <Title
            order={1}
            ta="center"
            c={colors['blue-button']}
            fz={{ base: '2rem', md: '3.6rem' }}
            lh={{ base: 1.2, md: 1.1 }}
          >
            {textHeading.title}
          </Title>

          <Text
            ta="center"
            fz={{ base: '1rem', md: '1.25rem' }}
            lh={{ base: 1.5, md: 1.55 }}
            c="black"
          >
            {textHeading.des}
          </Text>
        </Stack>
      </Box>

      {/* Button Lihat Semua */}
      <Group justify="center">
        <Button
          component={Link}
          href="/darmasaba/apbdes"
          radius="xl"
          size="lg"
          variant="gradient"
          gradient={{ from: "#26667F", to: "#124170" }}
        >
          Lihat Semua Data
        </Button>
      </Group>

      {/* COMBOBOX */}
      <Box px={{ base: 'md', md: 100 }}>
        <Select
          label={<Text fw={600} fz="sm">Pilih Tahun APBDes</Text>}
          placeholder="Pilih tahun"
          value={selectedYear}
          onChange={setSelectedYear}
          data={years}
          w={{ base: '100%', sm: 220 }}
          searchable
          clearable
          nothingFoundMessage="Tidak ada tahun tersedia"
        />
      </Box>

      {/* Progress */}
      {currentApbdes ? (
        <APBDesProgress apbdesData={currentApbdes} />
      ) : (
        <Box px={{ base: 'md', md: 100 }} py="md">
          <Text fz="sm" c="dimmed" ta="center" lh={1.5}>
            Tidak ada data APBDes untuk tahun yang dipilih.
          </Text>
        </Box>
      )}

      {/* GRID */}
      <SimpleGrid
        mx={{ base: 'md', md: 100 }}
        cols={{ base: 1, sm: 3 }}
        spacing="lg"
        pb="xl"
      >
        {loading ? (
          <Center mih={200}>
            <Loader size="lg" color="blue" />
          </Center>
        ) : data.length === 0 ? (
          <Center mih={200}>
            <Stack align="center" gap="xs">
              <Text fz="lg" c="dimmed" lh={1.4}>
                Belum ada data APBDes yang tersedia
              </Text>
              <Text fz="sm" c="dimmed" lh={1.4}>
                Data akan ditampilkan di sini setelah diunggah
              </Text>
            </Stack>
          </Center>
        ) : (
          data.map((v, k) => (
            <BackgroundImage
              key={k}
              src={v.image?.link || ''}
              h={360}
              radius="xl"
              pos="relative"
              style={{ overflow: 'hidden' }}
            >
              <Box pos="absolute" inset={0} bg="rgba(0,0,0,0.45)" style={{ borderRadius: 16 }} />

              <Stack gap="xs" justify="space-between" h="100%" p="xl" pos="relative">
                <Text
                  c="white"
                  fw={600}
                  fz={{ base: 'lg', md: 'xl' }}
                  ta="center"
                  lh={1.35}
                  lineClamp={2}
                >
                  {v.name}
                </Text>

                <Text
                  fw={700}
                  c="white"
                  fz={{ base: '2.4rem', md: '3.2rem' }}
                  ta="center"
                  lh={1}
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                >
                  {v.jumlah}
                </Text>

                <Center>
                  <ActionIcon
                    component={Link}
                    href={v.file?.link || ''}
                    radius="xl"
                    size="xl"
                    variant="gradient"
                    gradient={{ from: '#1C6EA4', to: '#1C6EA4' }}
                  >
                    <IconDownload size={20} color="white" />
                  </ActionIcon>
                </Center>
              </Stack>
            </BackgroundImage>
          ))
        )}
      </SimpleGrid>
    </Stack>
  )
}

export default Apbdes
