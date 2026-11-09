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
import BackButton from '../../pemerintahan/layanan/_com/BackButto'
import './struktur.css'
import { useMediaQuery } from '@mantine/hooks'

// Lebar maksimum panel kontrol & kartu "data kosong" — dipusatkan oleh parent,
// menyusut penuh di layar sempit supaya tidak meluber atau melenceng dari tengah.
const CONTROLS_MAX_WIDTH = 560
const EMPTY_STATE_MAX_WIDTH = 560

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
            lh={{ base: 1.05, md: 1.03 }}
          >
            Struktur Organisasi PPID
          </Title>
          <Text ta="center" c="black" maw={800} fz={{ base: 13, md: 15 }} lh={1.45}>
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
    }, 1000)
  ).current

  useEffect(() => {
    void stateOrganisasi.findMany.load()
  }, [])

  // Sinkronkan label tombol dengan status fullscreen browser sebenarnya —
  // keluar via ESC tidak memanggil toggleFullscreen, jadi label bisa nyangkut di "Exit".
  // Safari (lama) hanya punya API ber-prefix webkit, jadi dengarkan kedua event
  // dan cek kedua properti agar status tetap sinkron.
  useEffect(() => {
    const doc = document as any
    const handleFullscreenChange = () => {
      setFullscreen(Boolean(doc.fullscreenElement || doc.webkitFullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const isLoading =
    !stateOrganisasi.findMany.data && stateOrganisasi.findMany.loading !== false

  if (isLoading) {
    return (
      <Center py={48}>
        <Stack align="center" gap="sm">
          <Loader size="lg" />
          <Text fw={600} fz={{ base: 15, md: 16 }} lh={1.2}>Memuat struktur organisasi…</Text>
          <Text c="dimmed" fz={{ base: 12, md: 13 }} lh={1.4}>
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
        <Stack align="center" gap="md" w="100%">
          <Paper
            radius="md"
            p="xl"
            w="100%"
            maw={EMPTY_STATE_MAX_WIDTH}
            style={{
              background: 'rgba(28,110,164,0.2)',
              border: `1px solid rgba(255,255,255,0.1)`,
              textAlign: 'center',
            }}
          >
            <Center>
              <IconUsers size={56} />
            </Center>
            <Title order={3} mt="md" fz={{ base: 16, md: 18 }} lh={1.15}>
              Data pegawai belum tersedia
            </Title>
            <Text c="dimmed" mt="xs" fz={{ base: 13, md: 14 }} lh={1.4}>
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
        image: pegawai?.image?.link || '/default-avatar.svg',
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
  // Safari (lama) tidak mendukung requestFullscreen/exitFullscreen tanpa prefix,
  // sehingga tombol seolah "tidak bisa diklik" (klik tidak beraksi). Pakai
  // fallback ber-prefix webkit agar berfungsi di Safari.
  const toggleFullscreen = () => {
    const doc = document as any
    const el = chartContainerRef.current as any
    const isFs = doc.fullscreenElement || doc.webkitFullscreenElement
    if (!isFs) {
      const request = el?.requestFullscreen || el?.webkitRequestFullscreen
      request?.call(el)
      setFullscreen(true)
    } else {
      const exit = doc.exitFullscreen || doc.webkitExitFullscreen
      exit?.call(document)
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
        w="100%"
        maw={CONTROLS_MAX_WIDTH}
        p="md"
        radius="md"
        style={{
          background: colors['blue-button'],
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
                flexShrink: 0,
              },
            }}
            style={{ width: '100%' }}
          >
            {/* Wrap + justify center (bukan scroll horizontal): tombol selalu terpusat,
                tidak ada tombol yang terpotong/tersembunyi di layar sempit. */}
            <TabsList
              style={{
                display: 'flex',
                gap: '4px',
                paddingBottom: '4px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                maxWidth: '100%',
              }}
            >
              <TabsTab
                value="zoom-out"
                onClick={handleZoomOut}
                leftSection={<IconZoomOut size={16} />}
                style={{ flexShrink: 0 }}
              >
                <Text fz={{ base: 12, sm: 13 }} lh={1} ta="center">Zoom Out</Text>
              </TabsTab>

              <Box
                bg={colors['blue-button-2']}
                c={colors['blue-button']}
                px={12}
                py={6}
                style={{
                  fontWeight: 700,
                  borderRadius: '6px',
                  minWidth: 60,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <Text fz={{ base: 12, sm: 13 }} lh={1} c={colors['blue-button']}>
                  {Math.round(scale * 100)}%
                </Text>
              </Box>

              <TabsTab
                value="zoom-in"
                onClick={handleZoomIn}
                leftSection={<IconZoomIn size={16} />}
                style={{ flexShrink: 0 }}
              >
                <Text fz={{ base: 12, sm: 13 }} lh={1} ta="center">Zoom In</Text>
              </TabsTab>

              <TabsTab
                value="reset"
                onClick={resetZoom}
                style={{ flexShrink: 0 }}
              >
                <Text fz={{ base: 12, sm: 13 }} lh={1} ta="center">Reset</Text>
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
                <Text fz={{ base: 12, sm: 13 }} lh={1} ta="center">
                  {isFullscreen ? 'Exit' : 'Fullscreen'}
                </Text>
              </TabsTab>
            </TabsList>
          </Tabs>
        </Stack>
      </Paper>

      {/* 🧩 Chart Container */}
      <Center style={{ width: '100%' }}>
        <Box
          ref={chartContainerRef}
          className="struktur-fullscreen"
          style={{
            transition: 'transform 0.2s ease',
          }}
        >
          {/* zoom (bukan transform: scale) memengaruhi layout, jadi chart tetap di
              tengah saat lebih sempit dari container dan bisa di-scroll penuh saat
              lebih lebar — transform membuat sisi kiri terpotong & tak bisa di-scroll.
              margin auto di flex item: terpusat bila muat, rata kiri bila meluber. */}
          <Box style={{
            zoom: scale,
            flexShrink: 0,
            margin: '0 auto',
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
  const imageSrc = node?.data?.image || '/default-avatar.svg'
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
            height: isMobile ? 290 : 300, // tinggi tetap — sel-sel node di baris yang sama harus sama tinggi supaya garis line-down turun sejajar. Dinaikkan dari 240/280 karena foto+nama 2 baris+jabatan 2 baris+tombol butuh ±288px, sebelumnya kepotong
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
                fallbackSrc="/default-avatar.svg"
                style={{
                  objectFit: 'cover',
                }}
              />
            </Box>

            {/* Name */}
            {/* Box pembungkus menangani centering vertikal — display:flex tidak boleh
                dipasang langsung di Text karena akan menimpa -webkit-line-clamp milik
                lineClamp, sehingga teks panjang gagal terpotong dan meluber keluar Card */}
            <Box style={{ minHeight: 40, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text
                fw={700}
                ta="center"
                c={colors['blue-button']}
                lineClamp={2}
                fz={{ base: 13, md: 15 }}
                lh={1.2}
                style={{ wordBreak: 'break-word' }}
              >
                {name}
              </Text>
            </Box>

            {/* Title/Position */}
            <Box style={{ minHeight: 32, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text
                c="dimmed"
                ta="center"
                fw={500}
                lineClamp={2}
                fz={{ base: 12, md: 13 }}
                lh={1.3}
                style={{ wordBreak: 'break-word' }}
              >
                {title}
              </Text>
            </Box>

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
                <Text c={"white"} fz={{ base: 12, md: 13 }} lh={1} ta="center">Lihat Detail</Text>
              </Button>
            )}
          </Stack>
        </Card>
      )}
    </Transition>
  )
}
