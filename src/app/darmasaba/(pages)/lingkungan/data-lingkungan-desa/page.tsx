'use client'
import dataLingkunganDesaState from '@/app/admin/(dashboard)/_state/lingkungan/data-lingkungan-desa';
import colors from '@/con/colors';
import { Badge, Box, Center, Group, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { Icon, IconAlertTriangle, IconAmbulance, IconBook, IconBuilding, IconBuildingCommunity, IconCash, IconChartLine, IconChristmasTreeFilled, IconClipboard, IconDroplet, IconFileText, IconFiretruck, IconFirstAidKit, IconHome, IconHomeEco, IconHospital, IconInfoCircle, IconLeaf, IconLifebuoy, IconMessageReport, IconPhoneCall, IconRecycle, IconRun, IconScale, IconSchool, IconSearch, IconShield, IconShieldFilled, IconShoppingCart, IconStethoscope, IconTent, IconTrash, IconTree, IconTrendingUp, IconTrophy, IconTruck, IconUsers } from '@tabler/icons-react';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const state = useProxy(dataLingkunganDesaState.findMany)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 1000); // 500ms delay

  const {
    data,
    load,
    page,
    totalPages,
  } = state

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

  useShallowEffect(() => {
    load(page, 6, debouncedSearch)
  }, [page, debouncedSearch])

  if (state.loading || !data) {
    return (
      <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
        <Skeleton h={500} />
      </Stack>
    )
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="28px">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Group justify="space-between" align='center' mt="md">
          <Text ta="center" fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw="bold">
            Data Lingkungan Desa
          </Text>
          <TextInput
            radius="xl"
            w={{base: "100%", md: "30%"}}
            placeholder="Cari Data Lingkungan Desa"
            leftSection={<IconSearch size={20} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </Group>
        <Text fz="md" pt={20}>
          Desa Darmasaba menjaga dan mengembangkan lingkungan demi kesejahteraan warganya. 
        </Text>
        <Text fz="md">
          Fokus utama meliputi penghijauan, pengelolaan sampah, dan perlindungan kawasan hijau.
        </Text>
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {data.map((item) => (
            <Paper
              key={item.id}
              p="lg"
              bg={colors['white-trans-2']}
              radius="md"
              shadow="xl"
              style={{ transition: 'all 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 0 20px ${colors['blue-button']}` } }}
            >
              <Stack align="center" gap="md">
                <Tooltip label={item.name} position="top" withArrow>
                  <Center>
                    {iconMap[item.icon] ? (
                      React.createElement(iconMap[item.icon], { 
                        size: 55, 
                        color: colors['blue-button'],
                        style: { 
                          transition: 'all 0.3s',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }
                      })
                    ) : null}
                  </Center>
                </Tooltip>
                <Text fw="bold" fz="xl" c={colors['blue-button']}>
                ± {item.jumlah}
                </Text>
                <Text ta="center" fz="md" style={{wordBreak: "break-word", whiteSpace: "normal"}} c={"black"} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                <Badge variant="gradient" gradient={{ from: '#1C6EA4', to: '#69C0FF' }} size="sm">
                  {item.name}
                </Badge>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
        <Center mt="xl">
          <Pagination
            value={page}
            onChange={(newPage) => load(newPage)}
            total={totalPages}
            color="blue"
            radius="xl"
          />
        </Center>
      </Box>
    </Stack>
  );
}

export default Page;
