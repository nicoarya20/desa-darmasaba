/* eslint-disable @typescript-eslint/no-unused-vars */
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
            Struktur Organisasi Dan SK Pengurus BumDes
          </Title>
          <Text ta="center" c="black" maw={800}>
            Gambaran visual peran dan pegawai yang ditugaskan. Arahkan kursor
            untuk melihat detail atau klik node untuk fokus tampilan.
          </Text>
        </Stack>
        <Box mt="lg">
          <StrukturOrganisasiBumDes />
        </Box>
      </Container>
    </Box>
  )
}

function StrukturOrganisasiBumDes() {
  const stateOrganisasi: any = useProxy(stateStrukturBumDes.pegawai)

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
              Belum ada data pegawai yang tercatat untuk BumDes. Silakan coba
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

  // First, create a map of all unique positions
const allPositions = new Map();
aktifPegawai.forEach((pegawai: any) => {
  if (!allPositions.has(pegawai.posisi.id)) {
    allPositions.set(pegawai.posisi.id, {
      ...pegawai.posisi,
      pegawaiList: [],
      children: []
    });
  }
});

// Then assign employees to their positions
aktifPegawai.forEach((pegawai: any) => {
  const posisi = allPositions.get(pegawai.posisi.id);
  if (posisi) {
    posisi.pegawaiList.push(pegawai);
  }
});

// Now build the hierarchy
const root = [];
for (const [_, posisi] of allPositions) {
  if (posisi.parentId) {
    const parent = allPositions.get(posisi.parentId);
    if (parent) {
      parent.children.push(posisi);
    } else {
      // Only add to root if it's a top-level position
      if (!posisi.parentId) {
        root.push(posisi);
      }
    }
  } else {
    root.push(posisi);
  }
}
  function toOrgChartFormat(node: any): any {
    return {
      expanded: true,
      type: 'person',
      styleClass: 'p-person',
      data: {
        name: node.pegawaiList?.[0]?.namaLengkap || 'Belum ditugaskan',
        title: node.nama || 'Tanpa jabatan',
        image: node.pegawaiList?.[0]?.image?.link || '/img/default.png',
        description: node.deskripsi || '',
        positionId: node.id || null,
      },
      children: node.children?.map(toOrgChartFormat) || [],
    }
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
          nodeTemplate={nodeTemplate}
        />
      </Paper>
    </Box>
  )
}

function nodeTemplate(node: any) {
  const imageSrc = node?.data?.image || '/img/default.png'
  const name = node?.data?.name || 'Tanpa Nama'
  const title = node?.data?.title || 'Tanpa Jabatan'
  const description = node?.data?.description || ''

  return (
    <Transition  mounted transition="pop" duration={240}>
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
          <Tooltip label="Kembali ke struktur organisasi" withArrow position="bottom">
            <Button
              variant="light"
              size="xs"
              mt="md"
              onClick={() => {
                const id = node?.data?.positionId
                if (id && (window as any).scrollTo) {
                  ;(window as any).scrollTo({ top: 0, behavior: 'smooth' })
                }
              }}
            >
              Kembali
            </Button>
          </Tooltip>
        </Card>
      )}
    </Transition>
  )
}


