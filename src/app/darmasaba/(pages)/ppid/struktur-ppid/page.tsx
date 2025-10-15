/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID'
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
  Title,
  Tooltip,
  Transition,
} from '@mantine/core'
import { IconRefresh, IconSearch, IconUsers } from '@tabler/icons-react'
import { OrganizationChart } from 'primereact/organizationchart'
import { useEffect } from 'react'
import { useProxy } from 'valtio/utils'
import BackButton from '../../desa/layanan/_com/BackButto'
import { useTransitionRouter } from 'next-view-transitions'
import ScrollToTopButton from '@/app/darmasaba/_com/scrollToTopButton'

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
            Mengambil data pegawai dan posisi. Mohon tunggu sebentar.
          </Text>
        </Stack>
      </Center>
    )
  }

  if (
    !stateOrganisasi.findMany.data ||
    stateOrganisasi.findMany.data.length === 0
  ) {
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
              Belum ada data pegawai yang tercatat untuk PPID. Silakan coba
              muat ulang atau periksa sumber data.
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
              <Button
                leftSection={<IconSearch size={16} />}
                variant="subtle"
                onClick={() =>
                  stateOrganisasi.findMany.load({ query: { q: '' } })
                }
              >
                Cari Pegawai
              </Button>
            </Group>
          </Paper>
        </Stack>
      </Center>
    )
  }

  const posisiMap = new Map<string, any>()

  const aktifPegawai = stateOrganisasi.findMany.data.filter((p: any) => p.isActive);

  for (const pegawai of aktifPegawai) {
    const posisiId = pegawai.posisi.id;
    if (!posisiMap.has(posisiId)) {
      posisiMap.set(posisiId, {
        ...pegawai.posisi,
        pegawaiList: [],
        children: [],
      });
    }
    posisiMap.get(posisiId)!.pegawaiList.push(pegawai);
  }

  const root: any[] = []
  posisiMap.forEach((posisi) => {
    if (posisi.parentId) {
      const parent = posisiMap.get(posisi.parentId)
      if (parent) {
        parent.children.push(posisi)
      } else {
        root.push(posisi)
      }
    } else {
      root.push(posisi)
    }
  })

  function toOrgChartFormat(node: any): any {
    const pegawai = node.pegawaiList?.[0];
    return {
      expanded: true,
      type: 'person',
      styleClass: 'p-person',
      data: {
        id: pegawai?.id || null, // tambahin ini bro
        name: pegawai?.namaLengkap || 'Belum ditugaskan',
        title: node.nama || 'Tanpa jabatan',
        image: pegawai?.image?.link || '/img/default.png',
        description: node.deskripsi || '',
        positionId: node.id || null,
      },
      children: node.children?.map(toOrgChartFormat) || [],
    };
  }

  const chartData = root.map(toOrgChartFormat)

  return (
    <Box py={16} >
      <Paper
        radius="md"
        p="md"
        style={{
          background: 'rgba(28,110,164,0.2)',
          border: `1px solid rgba(255,255,255,0.1)`,
          overflowX: 'auto',
        }}
      >
        <OrganizationChart
          value={chartData}
          nodeTemplate={(node) => nodeTemplate(node, router)}
        />
      </Paper>
    </Box>
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
            width={120}
            height={120}
            fit="cover"
            style={{
              objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.2)',
              marginBottom: 12,
            }}
            loading='lazy'
          />
          <Text fw={700}>{name}</Text>
          <Text size="sm" c="dimmed" mt={4}>
            {title}
          </Text>
          <Text size="xs" c="dimmed" mt={8} lineClamp={3}>
            {description || 'Belum ada deskripsi.'}
          </Text>
          <Tooltip label="Lihat Detail" withArrow position="bottom">
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
          </Tooltip>
        </Card>
      )}
    </Transition>
  )
}
