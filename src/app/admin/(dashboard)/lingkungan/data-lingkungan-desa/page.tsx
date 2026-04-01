/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconAmbulance,
  IconBook,
  IconBuilding,
  IconBuildingCommunity,
  IconCash,
  IconChartLine,
  IconChristmasTreeFilled,
  IconClipboardTextFilled,
  IconDeviceImacCog,
  IconDroplet,
  IconFileText,
  IconFiretruck,
  IconFirstAidKit,
  IconHome,
  IconHomeEco,
  IconHospital,
  IconInfoCircle,
  IconLeaf,
  IconLifebuoy,
  IconMessageReport,
  IconPhoneCall,
  IconPlus,
  IconRecycle,
  IconRun,
  IconScale,
  IconSchool,
  IconSearch,
  IconShield,
  IconShieldFilled,
  IconShoppingCart,
  IconStethoscope,
  IconTent,
  IconTrashFilled,
  IconTree,
  IconTrendingUp,
  IconTrophy,
  IconTruckFilled,
  IconUsers,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import dataLingkunganDesaState from '../../_state/lingkungan/data-lingkungan-desa';
import { useDebouncedValue } from '@mantine/hooks';

function DataLingkunganDesa() {
  const [search, setSearch] = useState('');
  return (
    <Box py={{ base: 'md', md: 'lg' }} px={{ base: 'sm', md: 0 }}>
      <HeaderSearch
        title='Data Lingkungan Desa'
        placeholder='Cari data lingkungan...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDataLingkunganDesa search={search} />
    </Box>
  );
}

function ListDataLingkunganDesa({ search }: { search: string }) {
  const listState = useProxy(dataLingkunganDesaState);
  const { data, loading, page, totalPages, load } = listState.findMany;
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

 const iconMap: Record<string, React.FC<any>> = {
     // ===== Umum & Lingkungan =====
     ekowisata: IconLeaf,
     kompetisi: IconTrophy,
     wisata: IconTent,
     ekonomi: IconChartLine,
     sampah: IconRecycle,
     truck: IconTruckFilled,
     scale: IconScale,
     clipboard: IconClipboardTextFilled,
     trash: IconTrashFilled,
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
 
     // ===== Pemerintahan & Fasilitas =====
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
      <Stack py="md">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py="md">
        <Paper withBorder shadow="md" radius="md" p={{ base: 'md', md: 'lg' }} bg={colors['white-1']}>
          <Stack>
            <Group justify="space-between" mb="md">
              <Title order={4} lh={1.2}>
                Daftar Data Lingkungan Desa
              </Title>
              <Button
                leftSection={<IconPlus size={18} />}
                color="blue"
                variant="light"
                onClick={() => router.push('/admin/lingkungan/data-lingkungan-desa/create')}
              >
                Tambah Baru
              </Button>
            </Group>
           <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
             <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false} miw={0} style={{ tableLayout: 'fixed', width: '100%' }}>
                <TableThead>
                  <TableTr>
                    <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
                    <TableTh style={{ width: '25%' }}>Nama Data Lingkungan Desa</TableTh>
                    <TableTh style={{ width: '35%' }}>Jumlah</TableTh>
                    <TableTh style={{ width: '15%' }}>Ikon</TableTh>
                    <TableTh style={{ width: '20%', textAlign: 'center' }}>Detail</TableTh>
                  </TableTr>
                </TableThead>
              </Table>
            </Box>
            <Center py="xl">
              <Text c="dimmed" fz={{ base: 'sm', md: 'md' }} lh={1.4}>
                Tidak ada data lingkungan desa yang tersedia
              </Text>
            </Center>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box py="md">
      <Paper withBorder shadow="md" radius="md" p={{ base: 'md', md: 'lg' }} bg={colors['white-1']}>
        <Group justify="space-between" mb="md">
          <Title order={4} lh={1.2}>
            Daftar Data Lingkungan Desa
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/lingkungan/data-lingkungan-desa/create')}
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
       <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
         <Table highlightOnHover
    layout="fixed" // 🔥 PENTING
    withColumnBorders={false} miw={0} style={{ tableLayout: 'fixed', width: '100%' }}>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
                <TableTh style={{ width: '25%' }}>Nama Data</TableTh>
                <TableTh style={{ width: '35%' }}>Jumlah</TableTh>
                <TableTh style={{ width: '15%' }}>Ikon</TableTh>
                <TableTh style={{ width: '20%', textAlign: 'center' }}>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item, index) => (
                <TableTr key={item.id}>
                  <TableTd ta="center">{index + 1}</TableTd>
                  <TableTd>
                    <Text fz="md" fw={500} lh={1.5} truncate="end" lineClamp={1}>
                      {item.name}
                    </Text>
                  </TableTd>
                  <TableTd>
                    <Text fz="sm" c="dimmed" lh={1.5}>
                      ± {item.jumlah}
                    </Text>
                  </TableTd>
                  <TableTd>
                    {iconMap[item.icon] && <Box title={item.icon}>{React.createElement(iconMap[item.icon], { size: 22 })}</Box>}
                  </TableTd>
                  <TableTd ta="center">
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImacCog size={16} />}
                      onClick={() => router.push(`/admin/lingkungan/data-lingkungan-desa/${item.id}`)}
                    >
                      Detail
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          <Stack gap="sm">
            {filteredData.map((item, index) => (
              <Paper key={item.id} withBorder radius="md" p="sm" bg={colors['white-1']}>
                <Stack gap={"xs"}>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      No
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {index + 1}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Nama Data
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4} truncate="end">
                      {item.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Jumlah
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      ± {item.jumlah}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Ikon
                    </Text>
                    {iconMap[item.icon] && <Box title={item.icon}>{React.createElement(iconMap[item.icon], { size: 22 })}</Box>}
                  </Box>
                  <Center>
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImacCog size={16} />}
                      onClick={() => router.push(`/admin/lingkungan/data-lingkungan-desa/${item.id}`)}
                    >
                      Detail
                    </Button>
                  </Center>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default DataLingkunganDesa;