/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import stateStrukturBumDes from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi/struktur-organisasi'
import colors from '@/con/colors'
import {
  Box,
  Button,
  Card,
  Center,
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
      <Box px={{ base: 'md', md: 100 }} py="xl">
        <BackButton />
        <Stack align="center" gap="xl" mt="xl">
          <Title
            order={1}
            ta="center"
            c={colors['blue-button']}
            fz={{ base: 28, md: 36, lg: 44 }}
          >
            Struktur Organisasi & SK Pengurus BumDes
          </Title>
          <Text ta="center" c="black" maw={800}>
            Gambaran visual peran dan pengurus yang ditugaskan. Gunakan kontrol
            di bawah untuk mencari, memperbesar, atau melihat lebih jelas.
          </Text>
        </Stack>

        <Box mt="lg">
          <StrukturOrganisasiBumDes />
        </Box>
      </Box>
    </Box>
  )
}

function StrukturOrganisasiBumDes() {
  const stateOrganisasi: any = useProxy(stateStrukturBumDes.pegawai)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [isFullscreen, setFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useRef(
    debounce((value: string) => setSearchQuery(value), 400)
  ).current

  useEffect(() => {
    void stateOrganisasi.findMany.load()
  }, [])

  const isLoading =
    !stateOrganisasi.findMany.data &&
    stateOrganisasi.findMany.loading !== false

  if (isLoading) {
    return (
      <Center py={48}>
        <Stack align="center" gap="sm">
          <Loader size="lg" />
          <Text fw={600}>Memuat struktur organisasi…</Text>
          <Text c="dimmed" size="sm">
            Mengambil data pengurus dan posisi. Mohon tunggu sebentar.
          </Text>
        </Stack>
      </Center>
    )
  }

  const data = stateOrganisasi.findMany.data || []
  if (data.length === 0) {
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
              Data pengurus belum tersedia
            </Title>
            <Text c="dimmed" mt="xs">
              Belum ada data pengurus yang tercatat untuk BumDes.
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

  // 📊 susun struktur organisasi
  const posisiMap = new Map<string, any>()
  const aktifPegawai = data.filter((p: any) => p.isActive)

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

  const toOrgChartFormat = (node: any): any => {
    const pegawai = node.pegawaiList?.[0]
    return {
      expanded: true,
      data: {
        id: pegawai?.id,
        name: pegawai?.namaLengkap || 'Belum Ditugaskan',
        title: node.nama || 'Tanpa Jabatan',
        image: pegawai?.image?.link || '/img/default.png',
        description: node.deskripsi || '',
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

  // 🔍 fullscreen dan zoom control
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      chartContainerRef.current?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 2))
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.5))
  const resetZoom = () => setScale(1)

  return (
    <Stack align="center" mt="xl">
      {/* 🧭 Kontrol atas */}
      <Paper shadow="xs" p="md" radius="md" bg={colors['blue-button']}>
        <Group gap="sm" wrap="wrap" justify="center">
          <TextInput
            placeholder="Cari nama atau jabatan..."
            leftSection={<IconSearch size={16} />}
            onChange={(e) => debouncedSearch(e.target.value)}
            styles={{
              input: {
                minWidth: 250,
              },
            }}
          />
          <Group gap="xs">
            <Button
              variant="light"
              bg={colors['blue-button-2']}
              c={colors['blue-button']}
              size="sm"
              onClick={handleZoomOut}
              leftSection={<IconZoomOut size={16} />}
            >
              Zoom Out
            </Button>
            <Box
              bg={colors['blue-button-2']}
              c={colors['blue-button']}
              px={16}
              py={8}
              style={{
                fontSize: 14,
                fontWeight: 700,
                borderRadius: '8px',
                minWidth: 70,
                textAlign: 'center',
              }}
            >
              {Math.round(scale * 100)}%
            </Box>
            <Button
              variant="light"
              bg={colors['blue-button-2']}
              c={colors['blue-button']}
              size="sm"
              onClick={handleZoomIn}
              leftSection={<IconZoomIn size={16} />}
            >
              Zoom In
            </Button>
            <Button
              variant="light"
              bg={colors['blue-button-2']}
              c={colors['blue-button']}
              size="sm"
              onClick={resetZoom}
            >
              Reset
            </Button>
            <Button
              variant="light"
              bg={colors['blue-button-2']}
              c={colors['blue-button']}
              size="sm"
              onClick={toggleFullscreen}
              leftSection={
                isFullscreen ? (
                  <IconArrowsMinimize size={16} />
                ) : (
                  <IconArrowsMaximize size={16} />
                )
              }
            >
              Fullscreen
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* 📊 Chart Container */}
      <Center style={{ width: '100%' }}>
        <Box
          ref={chartContainerRef}
          style={{
            overflowX: 'auto',
            overflowY: 'auto',
            width: '100%',
            padding: '32px 16px',
            transition: 'transform 0.2s ease',
            transform: `scale(${scale})`,
            transformOrigin: 'center top',
          }}
        >
          <OrganizationChart
            value={chartData}
            nodeTemplate={(node) => <NodeCard node={node} />}
            className="p-organizationchart p-organizationchart-horizontal"
          />
        </Box>
      </Center>
    </Stack>
  )
}

function NodeCard({ node }: any) {
  const imageSrc = node?.data?.image || '/img/default.png'
  const name = node?.data?.name || 'Tanpa Nama'
  const title = node?.data?.title || 'Tanpa Jabatan'
  const description = node?.data?.description || ''

  return (
    <Transition mounted transition="pop" duration={300}>
      {(styles) => (
        <Card
          shadow="md"
          radius="xl"
          withBorder
          style={{
            ...styles,
            width: 240,
            padding: 20,
            background:
              'linear-gradient(135deg, rgba(28,110,164,0.15) 0%, rgba(255,255,255,0.95) 100%)',
            borderColor: 'rgba(28, 110, 164, 0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          <Stack align="center" gap={10}>
            <Box
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid rgba(28, 110, 164, 0.4)',
              }}
            >
              <Image src={imageSrc} alt={name} fit="cover" loading="lazy" />
            </Box>
            <Text fw={700} size="sm" ta="center" c={colors['blue-button']}>
              {name}
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              {title}
            </Text>
            <Text size="xs" c="dimmed" ta="center" lineClamp={3}>
              {description || 'Belum ada deskripsi.'}
            </Text>
          </Stack>
        </Card>
      )}
    </Transition>
  )
}
