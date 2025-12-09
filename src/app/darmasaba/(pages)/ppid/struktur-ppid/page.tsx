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
  Group,
  Image,
  Loader,
  Paper,
  Stack,
  Tabs,
  TabsList,
  TabsTab,
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
import './struktur.css'
import { useMediaQuery } from '@mantine/hooks'

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
      <Box px={{ base: 'md', md: 100 }} py={"xl"}>
        <BackButton />

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
      </Box>

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

  // debounce pencarian
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

  // 🧩 buat struktur organisasi
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

  // 🎬 fullscreen & zoom control
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
      {/* 🔍 Controls */}
      <Paper
        shadow="xs"
        p="md"
        radius="md"
        style={{
          background: colors['blue-button'],
          width: '100%',       // ⬅️ penting
          maxWidth: '100%',    // ⬅️ penting
          overflowX: 'auto'    // ⬅️ untuk mencegah overflow
        }}
      >

        <Stack gap="sm">
          <Group justify='center'>
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
          </Group>
          <Tabs
            defaultValue="zoom-out"
            variant="outline"
            radius="md"
            styles={{
              panel: { display: 'none' },
              tab: {
                color: colors['blue-button'],
                backgroundColor: colors['blue-button-2'],
                border: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '6px 12px',
                minHeight: 'auto',
                flexShrink: 0, // 👈 PENTING: mencegah tab mengecil
              },
            }}
          >
            <TabsList
              style={{
                display: 'flex',
                overflowX: 'auto',
                overflowY: 'hidden', // 👈 tambahkan ini
                gap: '4px',
                paddingBottom: '4px',
                flexWrap: 'nowrap',
                WebkitOverflowScrolling: 'touch', // 👈 smooth scroll di iOS
                scrollbarWidth: 'thin', // 👈 scrollbar tipis di Firefox
                msOverflowStyle: '-ms-autohiding-scrollbar', // 👈 untuk IE/Edge
              }}
            >
              <TabsTab
                value="zoom-out"
                onClick={handleZoomOut}
                leftSection={<IconZoomOut size={16} />}
                style={{ flexShrink: 0 }} // 👈 pastikan tidak mengecil
              >
                Zoom Out
              </TabsTab>

              <Box
                bg={colors['blue-button-2']}
                c={colors['blue-button']}
                px={12}
                py={6}
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: '6px',
                  minWidth: 60,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  whiteSpace: 'nowrap', // 👈 mencegah text wrap
                }}
              >
                {Math.round(scale * 100)}%
              </Box>

              <TabsTab
                value="zoom-in"
                onClick={handleZoomIn}
                leftSection={<IconZoomIn size={16} />}
                style={{ flexShrink: 0 }}
              >
                Zoom In
              </TabsTab>

              <TabsTab
                value="reset"
                onClick={resetZoom}
                style={{ flexShrink: 0 }}
              >
                Reset
              </TabsTab>

              <TabsTab
                value="fullscreen"
                onClick={toggleFullscreen}
                leftSection={
                  isFullscreen ? (
                    <IconArrowsMinimize size={16} />
                  ) : (
                    <IconArrowsMaximize size={16} />
                  )
                }
                style={{ flexShrink: 0 }}
              >
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </TabsTab>
            </TabsList>
          </Tabs>
        </Stack>
      </Paper>

      {/* 🧩 Chart Container */}
      <Center style={{ width: '100%' }}>
        <Box
          ref={chartContainerRef}
          style={{
            overflowX: 'auto',
            overflowY: 'auto',
            width: '100%',
            maxWidth: '100%',
            padding: '32px 16px',
            transition: 'transform 0.2s ease',
          }}
        >
          <Box style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center top',
            display: 'inline-block', // 👈 agar tidak memenuhi lebar parent
            minWidth: 'min-content', // 👈 penting agar chart tidak dipaksa muat di width 100%
          }}>
            <OrganizationChart
              value={chartData}
              nodeTemplate={(node) => <NodeCard node={node} router={router} />}
              className="p-organizationchart p-organizationchart-horizontal"
            />
          </Box>
        </Box>
      </Center>
    </Stack>
  )
}

function NodeCard({ node, router }: any) {
  const imageSrc = node?.data?.image || '/img/default.png'
  const name = node?.data?.name || 'Tanpa Nama'
  const title = node?.data?.title || 'Tanpa Jabatan'
  const hasId = Boolean(node?.data?.id)
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Transition mounted transition="pop" duration={300}>
      {(styles) => (
        <Card
          shadow="md"
          radius="xl"
          withBorder
          style={{
            ...styles,
            width: '100%',
            maxWidth: isMobile ? 200 : 240, // lebih kecil di mobile
            minHeight: isMobile ? 240 : 280,
            padding: isMobile ? 16 : 20,
            background: 'linear-gradient(135deg, rgba(28,110,164,0.15) 0%, rgba(255,255,255,0.95) 100%)',
            borderColor: 'rgba(28, 110, 164, 0.3)',
            borderWidth: 2,
            transition: 'all 0.3s ease',
            cursor: hasId ? 'pointer' : 'default',
          }}
          onMouseEnter={(e) => {
            if (hasId) {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(28, 110, 164, 0.25)'
            }
          }}
          onMouseLeave={(e) => {
            if (hasId) {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = ''
            }
          }}
        >
          <Stack align="center" gap={12}>
            {/* Photo */}
            <Box
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid rgba(28, 110, 164, 0.4)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                background: 'white',
              }}
            >
              <Image
                src={imageSrc}
                alt={name}
                width={96}
                height={96}
                fit="cover"
                loading="lazy"
                style={{
                  objectFit: 'cover',
                }}
              />
            </Box>

            {/* Name */}
            <Text
              fw={700}
              size="sm"
              ta="center"
              c={colors['blue-button']}
              lineClamp={2}
              style={{
                // fontSize: 'clamp(12px, 4vw, 16px)', // 👈 responsif font size
                minHeight: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                wordBreak: 'break-word',
                lineHeight: 1.3,
              }}
            >
              {name}
            </Text>

            {/* Title/Position */}
            <Text
              size="xs"
              c="dimmed"
              ta="center"
              fw={500}
              lineClamp={2}
              style={{
                minHeight: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                wordBreak: 'break-word',
                lineHeight: 1.2,
              }}
            >
              {title}
            </Text>

            {/* Detail Button */}
            {hasId && (
              <Button
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                size="xs"
                fullWidth
                mt={8}
                radius="md"
                onClick={() =>
                  router.push(`/darmasaba/ppid/struktur-ppid/${node.data.id}`)
                }
                style={{
                  height: 32,
                  fontWeight: 600,
                }}
              >
                Lihat Detail
              </Button>
            )}
          </Stack>
        </Card>
      )}
    </Transition>
  )
}
