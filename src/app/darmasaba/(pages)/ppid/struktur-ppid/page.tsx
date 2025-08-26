/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// 'use client'
// import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID';
// import colors from '@/con/colors';
// import { Box, Image, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
// import { OrganizationChart } from 'primereact/organizationchart';
// import { useEffect } from 'react';
// import { useProxy } from 'valtio/utils';
// import BackButton from '../../desa/layanan/_com/BackButto';

// function Page() {
//   return (
//     <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
//       <Box px={{ base: 'md', md: 100 }}>
//         <BackButton />
//       </Box>
//       <Title ta={"center"} fz={{ base: "2rem", md: "2.5rem", lg: "3rem", xl: "3.5rem" }} c={colors["blue-button"]} fw={"bold"}>Struktur PPID</Title>
//         <StrukturOrganisasiPPID />
      
//     </Stack>
//   );
// }

// function StrukturOrganisasiPPID() {
//   const stateOrganisasi = useProxy(stateStrukturPPID.pegawai)

//   useEffect(() => {
//     stateOrganisasi.findMany.load()
//   }, [])

//   if (!stateOrganisasi.findMany.data || stateOrganisasi.findMany.data.length === 0) {
//     return (
//       <Stack py={10}>
//         <Skeleton h={500} />
//       </Stack>
//     );
//   }

//   // Step 1: Group pegawai berdasarkan posisiId
//   const posisiMap = new Map<string, any>();

//   for (const pegawai of stateOrganisasi.findMany.data) {
//     const posisiId = pegawai.posisi.id;
//     if (!posisiMap.has(posisiId)) {
//       posisiMap.set(posisiId, {
//         ...pegawai.posisi,
//         pegawaiList: [],
//         children: []
//       });
//     }
//     posisiMap.get(posisiId)!.pegawaiList.push(pegawai);
//   }


//   // Step 2: Buat struktur pohon berdasarkan parentId
//   const root: any[] = [];

//   posisiMap.forEach((posisi) => {
//     if (posisi.parentId) {
//       const parent = posisiMap.get(posisi.parentId);
//       if (parent) {
//         parent.children.push(posisi);
//       }
//     } else {
//       root.push(posisi);
//     }
//   });

//   // Step 3: Ubah struktur ke format OrganizationChart
//   function toOrgChartFormat(node: any): any {
//     return {
//       expanded: true,
//       type: 'person',
//       styleClass: 'p-person',
//       data: {
//         name: node.pegawaiList?.[0]?.namaLengkap || 'Tidak ada pegawai',
//         status: node.nama,
//         image: node.pegawaiList?.[0]?.image?.link || '/img/default.png'
//       },
//       children: node.children.map(toOrgChartFormat)
//     };
//   }


//   const chartData = root.map(toOrgChartFormat);

//   return (
//     <Box py={10}>
//       <Paper bg={colors.grey} p="md" style={{ overflowX: 'auto' }}>
//         <OrganizationChart style={{ color: colors['blue-button'] }} value={chartData} nodeTemplate={nodeTemplate} />
//       </Paper>
//     </Box>
//   );
// }


// function nodeTemplate(node: any) {
//   const imageSrc = node?.data?.image || '/img/default.png';
//   const name = node?.data?.name || 'Tanpa Nama';
//   const status = node?.data?.status || 'Tidak ada deskripsi';

//   return (
//     <Stack pos={"relative"} py={"xl"} gap={"22"}>
//       <Stack align="center" gap={4}>
//         <Image
//           src={imageSrc}
//           alt={name}
//           radius="xl"
//           w={120}
//           h={120}
//           fit="cover"
//         />
//         <Text fw={600} ta="center">{name}</Text>
//         <Text size="sm" c="dimmed" ta="center">{status}</Text>
//       </Stack>
//     </Stack>
//   );
// }

// export default Page;

'use client'
import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID'
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
import colors from '@/con/colors'

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
    </Box>
  )
}

function StrukturOrganisasiPPID() {
  const stateOrganisasi: any = useProxy(stateStrukturPPID.pegawai)

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
  for (const pegawai of stateOrganisasi.findMany.data) {
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
          />
          <Text fw={700}>{name}</Text>
          <Text size="sm" c="dimmed" mt={4}>
            {title}
          </Text>
          <Text size="xs" c="dimmed" mt={8} lineClamp={3}>
            {description || 'Belum ada deskripsi.'}
          </Text>
          <Tooltip label="Lihat detail" withArrow position="bottom">
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
              Detail
            </Button>
          </Tooltip>
        </Card>
      )}
    </Transition>
  )
}



