/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import programPenghijauanState from '@/app/admin/(dashboard)/_state/lingkungan/program-penghijauan';
import colors from '@/con/colors';
import { Box, Center, Group, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconAlertTriangle, IconAmbulance, IconBook, IconBuilding, IconBuildingCommunity, IconCash, IconChartLine, IconChristmasTreeFilled, IconClipboard, IconDroplet, IconFileText, IconFiretruck, IconFirstAidKit, IconHome, IconHomeEco, IconHospital, IconInfoCircle, IconLeaf, IconLifebuoy, IconMessageReport, IconPhoneCall, IconRecycle, IconRun, IconScale, IconSchool, IconSearch, IconShield, IconShieldFilled, IconShoppingCart, IconStethoscope, IconTent, IconTrash, IconTree, IconTrendingUp, IconTrophy, IconTruck, IconUsers } from '@tabler/icons-react';
import { useTransitionRouter } from 'next-view-transitions';
import React, { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const state = useProxy(programPenghijauanState);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const router = useTransitionRouter()
  const { data, load, page, totalPages, loading } = state.findMany;

  useShallowEffect(() => {
    load(page, 4, debouncedSearch);
  }, [page, debouncedSearch]);

  const iconMap: Record<string, any> = {
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

  if (loading || !data) {
    return (
      <Stack py={20}>
        <Skeleton h={500} radius="xl" />
      </Stack>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="xl">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Box>
          <Group justify="space-between" align='center' mt="md">
            <Text ta="center" fz={{ base: "h1", md: "2.5rem" }} c={colors["blue-button"]} fw="bold">
              Program Penghijauan Desa
            </Text>
            <TextInput
              radius="xl"
              w={'30%'}
              placeholder="Cari program atau kegiatan"
              leftSection={<IconSearch size={20} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />
          </Group>
        </Box>
        <Text fz="md" mt="sm">
          Mari berpartisipasi menanam dan merawat pohon untuk menciptakan lingkungan hijau,
        </Text>
        <Text fz="md">
          sehat, dan seimbang bagi seluruh warga desa.
        </Text>
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={60}>
        <Title order={2} c={colors['blue-button']} fw="bold" py={10} px={28} fz={{ base: 'lg', md: 'xl' }}>
          Manfaat Program
        </Title>
        <SimpleGrid cols={{ base: 1, md: 4 }} spacing="lg" mt="md">
          {data.map((v) => (
            <Paper
              key={v.id}
              p="xl"
              radius="xl"
              bg={colors['white-trans-1']}
              withBorder
              style={{
                backdropFilter: 'blur(10px)',
                border: `1px solid rgba(255,255,255,0.2)`,
                transition: 'transform 0.3s, box-shadow 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(-8px)';
                el.style.boxShadow = '0 15px 30px rgba(28,110,164,0.5)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
              }}
              onClick={() => router.push(`/darmasaba/lingkungan/program-penghijauan/${v.id}`)}
            >
              <Stack align="center" gap="sm">
                <Center>
                  {iconMap[v.icon] && React.createElement(iconMap[v.icon], { size: 50, stroke: 1.5, color: colors['blue-button'] })}
                </Center>
                <Tooltip label={v.judul} withArrow position="bottom">
                  <Text fz={{ base: 'md', md: 'lg' }} ta="center" c={colors['blue-button']} fw="bold">
                    {v.name}
                  </Text>
                </Tooltip>
                <Text fz="sm" ta="center" c="dimmed">
                  {v.judul}
                </Text>
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
