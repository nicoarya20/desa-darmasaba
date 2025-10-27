/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID'
import ScrollToTopButton from '@/app/darmasaba/_com/scrollToTopButton'
import colors from '@/con/colors'
import {
  Box,
  Button,
  Card,
  Center,
  Container,
  Group,
  Image,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Transition
} from '@mantine/core'
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconRefresh,
  IconSearch,
  IconUsers,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react'
import { debounce } from 'lodash'
import { useTransitionRouter } from 'next-view-transitions'
import { OrganizationChart } from 'primereact/organizationchart'
import { useEffect, useRef, useState } from 'react'
import { useProxy } from 'valtio/utils'
import BackButton from '../../desa/layanan/_com/BackButto'

export default function Page() {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: colors['Bg'],
        color: '#E6F0FF',
        paddingBottom: 48,
      }}
    >
      <Container size="xl" py="xl">
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        <Stack align="center" gap="xl" mt="xl">
          <Title
            order={1}
            ta="center"
            c={colors['blue-button']}
            fz={{ base: 28, md: 36, lg: 44 }}
          >
            Struktur Organisasi PPID
          </Title>
          <Text ta="center" c="black" maw={800}>
            Gambaran visual peran dan pegawai yang ditugaskan. Arahkan kursor
            untuk melihat detail atau klik node untuk fokus tampilan.
          </Text>
        </Stack>
        <Box mt="lg">
          <StrukturOrganisasiPPID />
        </Box>
      </Container>

      {/* Tombol Scroll ke Atas */}
      <ScrollToTopButton />
    </Box>
  )
}

function StrukturOrganisasiPPID() {
  const stateOrganisasi: any = useProxy(stateStrukturPPID.pegawai)
  const router = useTransitionRouter()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [isFullscreen, setFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // debounce untuk pencarian
  const debouncedSearch = useRef(
    debounce((value: string) => {
      setSearchQuery(value)
    }, 400)
  ).current

  useEffect(() => {
    void stateOrganisasi.findMany.load()
  }, [])

  const isLoading =
    !stateOrganisasi.findMany.data && stateOrganisasi.findMany.loading !== false

  if (isLoading) {
    return (
      <Center py={48}>
        <Stack align="center" gap="sm">
          <Loader size="lg" />
          <Text fw={600}>Memuat struktur organisasi…</Text>
          <Text c="dimmed" size="sm">
            Mengambil data pegawai dan posisi. Mohon tunggu sebentar.
          </Text>
        </Stack>
      </Center>
    )
  }

  if (!stateOrganisasi.findMany.data || stateOrganisasi.findMany.data.length === 0) {
    return (
      <Center py={40}>
        <Stack align="center" gap="md">
          <Paper
            radius="md"
            p="xl"
            style={{
              width: 560,
              background: 'rgba(28,110,164,0.2)',
              border: `1px solid rgba(255,255,255,0.1)`,
              textAlign: 'center',
            }}
          >
            <Center>
              <IconUsers size={56} />
            </Center>
            <Title order={3} mt="md">
              Data pegawai belum tersedia
            </Title>
            <Text c="dimmed" mt="xs">
              Belum ada data pegawai yang tercatat untuk PPID.
            </Text>
            <Group justify="center" mt="lg">
              <Button
                leftSection={<IconRefresh size={16} />}
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan' }}
                onClick={() => stateOrganisasi.findMany.load()}
              >
                Muat Ulang
              </Button>
            </Group>
          </Paper>
        </Stack>
      </Center>
    )
  }

  // Buat struktur organisasi
  const posisiMap = new Map<string, any>()
  const aktifPegawai = stateOrganisasi.findMany.data.filter((p: any) => p.isActive)

  for (const pegawai of aktifPegawai) {
    const posisiId = pegawai.posisi.id
    if (!posisiMap.has(posisiId)) {
      posisiMap.set(posisiId, {
        ...pegawai.posisi,
        pegawaiList: [],
        children: [],
      })
    }
    posisiMap.get(posisiId)!.pegawaiList.push(pegawai)
  }

  const root: any[] = []
  posisiMap.forEach((posisi) => {
    if (posisi.parentId) {
      const parent = posisiMap.get(posisi.parentId)
      if (parent) parent.children.push(posisi)
      else root.push(posisi)
    } else root.push(posisi)
  })

  function toOrgChartFormat(node: any): any {
    const pegawai = node.pegawaiList?.[0]
    return {
      expanded: true,
      type: 'person',
      styleClass: 'p-person',
      data: {
        id: pegawai?.id || null,
        name: pegawai?.namaLengkap || 'Belum ditugaskan',
        title: node.nama || 'Tanpa jabatan',
        image: pegawai?.image?.link || '/img/default.png',
        description: node.deskripsi || '',
        positionId: node.id || null,
      },
      children: node.children?.map(toOrgChartFormat) || [],
    }
  }

  let chartData = root.map(toOrgChartFormat)

  // 🔍 filter by search
  if (searchQuery) {
    const filterNodes = (nodes: any[]): any[] =>
      nodes
        .map((n) => ({
          ...n,
          children: filterNodes(n.children || []),
        }))
        .filter(
          (n) =>
            n.data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.children.length > 0
        )
    chartData = filterNodes(chartData)
  }

  // 🧭 fungsi fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      chartContainerRef.current?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  // 🧭 fungsi zoom
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5))
  const resetZoom = () => setScale(1)

  return (
    <Stack align="center" mt="xl">
      {/* 🔍 Search + Zoom + Fullscreen controls */}
      <Group mb="md" justify="center" gap="sm" align="center">
        <TextInput
          placeholder="Cari nama atau jabatan..."
          leftSection={<IconSearch size={16} />}
          onChange={(e) => debouncedSearch(e.target.value)}
        />

        <Button variant="light" size="sm" onClick={handleZoomOut}>
          <IconZoomOut size={16} />
        </Button>

        {/* 🔍 Tambahkan indikator zoom di sini */}
        {/* Floating Zoom Indicator */}
        <Box
          bg="#C3D0E8"
          c="blue"
          px={9}
          py={8}
          style={{
            fontSize: 14,
            fontWeight: 600,
            borderRadius: '5px',
          }}
        >
          {Math.round(scale * 100)}%
        </Box>


        <Button variant="light" size="sm" onClick={handleZoomIn}>
          <IconZoomIn size={16} />
        </Button>

        <Button variant="light" size="sm" onClick={resetZoom}>
          Reset
        </Button>

        <Button
          variant="light"
          size="sm"
          onClick={toggleFullscreen}
          leftSection={
            isFullscreen ? <IconArrowsMinimize size={16} /> : <IconArrowsMaximize size={16} />
          }
        >
          {isFullscreen ? 'Keluar' : 'Fullscreen'}
        </Button>
      </Group>


      {/* Chart Container */}
      <Box
        ref={chartContainerRef}
        style={{
          overflow: 'auto',
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          transition: 'transform 0.25s ease',
        }}
      >
        <OrganizationChart
          value={chartData}
          nodeTemplate={(node) => nodeTemplate(node, router)}
        />
      </Box>
    </Stack>
  )
}

function nodeTemplate(node: any, router: ReturnType<typeof useTransitionRouter>) {
  const imageSrc = node?.data?.image || '/img/default.png'
  const name = node?.data?.name || 'Tanpa Nama'
  const title = node?.data?.title || 'Tanpa Jabatan'
  const description = node?.data?.description || ''

  return (
    <Transition mounted transition="pop" duration={240}>
      {(styles) => (
        <Card
          radius="lg"
          withBorder
          style={{
            ...styles,
            width: 260,
            padding: 16,
            background: 'rgba(28,110,164,0.3)',
            borderColor: 'rgba(255,255,255,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Image
            src={imageSrc}
            alt={name}
            radius="md"
            width={60}
            height={60}
            fit="cover"
            style={{
              objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.2)',
              marginBottom: 12,
            }}
            loading="lazy"
          />
          <Text fw={700}>{name}</Text>
          <Text size="sm" c="dimmed" mt={4}>
            {title}
          </Text>
          <Text size="xs" c="dimmed" mt={8} lineClamp={3}>
            {description || 'Belum ada deskripsi.'}
          </Text>
            <Button
              variant="light"
              size="xs"
              mt="md"
              onClick={() => {
                const id = node?.data?.id
                router.push(`/darmasaba/ppid/struktur-ppid/${id}`)
              }}
            >
              Lihat Detail
            </Button>
        </Card>
      )}
    </Transition>
  )
}
