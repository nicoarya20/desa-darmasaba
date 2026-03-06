'use client'
import pengelolaanSampahState from '@/app/admin/(dashboard)/_state/lingkungan/pengelolaan-sampah';
import colors from '@/con/colors';
import { Box, Center, Flex, Group, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { Icon, IconAlertTriangle, IconAmbulance, IconBook, IconBuilding, IconBuildingCommunity, IconCash, IconChartLine, IconChristmasTreeFilled, IconClipboard, IconDroplet, IconFileText, IconFiretruck, IconFirstAidKit, IconHome, IconHomeEco, IconHospital, IconInfoCircle, IconLeaf, IconLifebuoy, IconMessageReport, IconPhoneCall, IconRecycle, IconRoute, IconRun, IconScale, IconSchool, IconSearch, IconShield, IconShieldFilled, IconShoppingCart, IconStethoscope, IconTent, IconTrash, IconTree, IconTrendingUp, IconTrophy, IconTruck, IconUsers } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

// Dynamically import the map component to avoid SSR issues with Leaflet
const LeafletMultiMarkerMap = dynamic(
  () => import('@/app/admin/(dashboard)/_com/LeafletMultiMarkerMap'),
  { ssr: false }
);


function Page() {
  const state = useProxy(pengelolaanSampahState.pengelolaanSampah)
  const state2 = useProxy(pengelolaanSampahState.keteranganSampah)

  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    load,

  } = state.findMany

  const {
    data: data2,
    load: load2,
    page,
    totalPages,
  } = state2.findMany

  useShallowEffect(() => {
    load()
    load2(page, 3, debouncedSearch)
  }, [page, debouncedSearch])

  const iconMap: Record<string, Icon> = {
  ekowisata: IconLeaf,
  kompetisi: IconTrophy,
  wisata: IconTent,
  ekonomi: IconChartLine,
  sampah: IconRecycle,
  truck: IconTruck,
  scale: IconScale,
  clipboard: IconClipboard,
  trash: IconTrash,
  lingkunganSehat: IconHomeEco,
  sumberOksigen: IconChristmasTreeFilled,
  ekonomiBerkelanjutan: IconTrendingUp,
  mencegahBencana: IconShieldFilled,
  rumah: IconHome,
  pohon: IconTree,
  air: IconDroplet,
  bantuan: IconCash,
  pelatihan: IconSchool,
  subsidi: IconShoppingCart,
  layananKesehatan: IconHospital,

  // ===== Keamanan & Darurat =====
  polisi: IconShieldFilled,
  ambulans: IconAmbulance,
  pemadam: IconFiretruck,
  darurat: IconAlertTriangle,
  sar: IconLifebuoy,
  evakuasi: IconRun,
  keamanan: IconShield,
  teleponDarurat: IconPhoneCall,

  // ===== Kesehatan =====
  rumahSakit: IconHospital,
  puskesmas: IconFirstAidKit,
  klinik: IconStethoscope,

  // ===== Pemerintahan =====
  bangunan: IconBuilding,
  kantorDesa: IconBuildingCommunity,
  administrasi: IconFileText,
  informasi: IconInfoCircle,
  pengaduan: IconMessageReport,
  layananPublik: IconUsers,
  book: IconBook
};

  if (state.findMany.loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} >
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Pengelolaan Sampah (Bank Sampah)
        </Text>
        <Text px={20} ta={'center'} fz={'h4'}>Bank Sampah di Desa Darmasaba berfungsi sebagai tempat pengelolaan sampah yang bertujuan untuk mengurangi limbah dan memberikan manfaat ekonomi bagi masyarakat.</Text>
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={60}>
        <Text fw={'bold'} py={10} px={28} fz={{ base: "lg", md: "xl" }} ta={"justify"}>
          Mekanisme Bank Sampah di Desa Darmasaba:
        </Text>
        <SimpleGrid
          cols={{
            base: 1,
            md: 1,
          }}
        >
          {data.map((v, k) => {
            return (
              <Box key={k} px={28}>
                <Paper p={20} bg={colors['white-trans-1']}>
                  <Flex gap={20} align={'center'}>
                    <Text>{k + 1}</Text>
                    <Box style={{ alignContent: 'center', alignItems: 'center' }}>
                      {iconMap[v.icon] ? React.createElement(iconMap[v.icon]) : null}
                    </Box>
                    <Text fz={{ base: "lg", md: "xl" }} c={'black'}>{v.name}</Text>
                  </Flex>
                </Paper>
              </Box>
            )
          })}
        </SimpleGrid>
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Text ta={"center"} fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw={"bold"}>
          Keterangan Bank Sampah Terdekat
        </Text>
        <TextInput
          mb={20}
          radius={'xl'}
          px={{ base: 70, md: 150 }}
          leftSection={<IconSearch size={20} />}
          placeholder='Cari Bank Sampah Terdekat'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {/* Left side - List of bank locations */}
          <Box>
            <Paper p="md" bg={colors['white-trans-1']} radius="lg">
              <Text fz="xl" fw="bold" mb="md">Daftar Bank Sampah</Text>
              <Stack gap="md">
                {data2?.map((v, k) => (
                  <Paper key={k} p="md" withBorder radius="md">
                    <Group justify='space-between'>
                      <Box>
                        <Text fw="bold" fz="lg">{v.namaTempatMaps}</Text>
                        <Text c="dimmed" fz="sm" mb="sm">{v.alamat}</Text>
                      </Box>
                      <Box>
                        <IconRoute color={colors['blue-button']} size={30} />
                        <Text fw={"bold"} fz="sm" c={colors['blue-button']}>Rute</Text>
                      </Box>
                    </Group>
                        {v.lat && v.lng ? (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: colors['blue-button'], textDecoration: 'none' }}
                          >
                            <Text fz="sm">📌 Lihat Peta Lebih Besar</Text>
                          </a>
                        ) : (
                          <Text c="dimmed" fz="sm">Koordinat belum tersedia</Text>
                        )}
                  </Paper>
                ))}
              </Stack>
              <Center>
                <Pagination
                  value={page}
                  onChange={(newPage) => load(newPage)} // ini penting!
                  total={totalPages}
                  my="md"
                />
              </Center>
            </Paper>
          </Box>

          {/* Right side - Single map showing all locations */}
          <Box style={{ position: 'sticky', top: '20px' }}>
            <Paper p="md" bg={colors['white-trans-1']} radius="lg" h="100%">
              <Text fz="xl" fw="bold" mb="md">Peta Lokasi</Text>
              {data2?.some(v => v.lat && v.lng) ? (
                <Box style={{ height: '600px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                  <LeafletMultiMarkerMap
                    center={[
                      data2[0]?.lat || -8.3405,
                      data2[0]?.lng || 115.0920
                    ]}
                    markers={data2
                      .filter(v => v.lat && v.lng)
                      .map(v => ({
                        position: [v.lat, v.lng],
                        popup: v.namaTempatMaps
                      }))}
                  />
                </Box>
              ) : (
                <Text c="dimmed" fz="sm">Tidak ada koordinat yang tersedia</Text>
              )}
            </Paper>
          </Box>
        </SimpleGrid>
      </Box>
    </Stack >
  );
}

export default Page;

