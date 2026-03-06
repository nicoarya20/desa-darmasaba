/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
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
import { useDebouncedValue } from '@mantine/hooks';
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
  IconDeviceImac,
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
  IconUsers
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import programKreatifState from '../../_state/inovasi/program-kreatif';

function ProgramKreatifDesa() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title="Program Kreatif Desa"
        placeholder="Cari program kreatif..."
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListProgramKreatifDesa search={search} />
    </Box>
  );
}

function ListProgramKreatifDesa({ search }: { search: string }) {
  const listState = useProxy(programKreatifState);
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
      <Stack py={{ base: 'sm', md: 'xl' }}>
        <Skeleton height={650} radius="md" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py={{ base: 'sm', md: 'xl' }}>
        <Paper p="lg" radius="md" shadow="sm" withBorder>
          <Stack gap="xl">
            <Group justify="space-between" wrap="nowrap">
              <Title order={4} lh={1.15}>
                Daftar Program Kreatif Desa
              </Title>
              <Button
                leftSection={<IconPlus size={18} />}
                color="blue"
                variant="light"
                onClick={() =>
                  router.push('/admin/inovasi/program-kreatif-desa/create')
                }
              >
                Tambah Baru
              </Button>
            </Group>

            <Box visibleFrom="md" style={{ overflowX: 'auto' }}>
              <Table
                highlightOnHover
                miw={0}
                striped
                style={{ tableLayout: 'fixed', width: '100%' }}
              >
                <TableThead>
                  <TableTr>
                    <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
                    <TableTh style={{ width: '20%' }}>Nama Program Kreatif Desa</TableTh>
                    <TableTh style={{ width: '35%' }}>Deskripsi Singkat</TableTh>
                    <TableTh style={{ width: '10%', textAlign: 'center' }}>Ikon</TableTh>
                    <TableTh style={{ width: '15%', textAlign: 'center' }}>Detail</TableTh>
                  </TableTr>
                </TableThead>
              </Table>
            </Box>

            <Text ta="center" c="dimmed" py="lg">
              Tidak ada data program kreatif desa yang tersedia
            </Text>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box py={{ base: 'sm', md: 'xl' }}>
      <Paper
        withBorder
        bg={colors['white-1']}
        p="lg"
        shadow="md"
        radius="md"
        h={{ base: 'auto', md: 650 }}
      >
        <Group justify="space-between" mb="xl" wrap="nowrap">
          <Title order={4} lh={1.15}>
            Daftar Program Kreatif Desa
          </Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push('/admin/inovasi/program-kreatif-desa/create')
            }
          >
            Tambah Baru
          </Button>
        </Group>

        {/* Desktop Table */}
        <Box visibleFrom="md" style={{ height: '100%', overflowY: 'auto' }}>
          <Table
            highlightOnHover
            miw={0}
            striped
            style={{ tableLayout: 'fixed', width: '100%' }}
          >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '5%', textAlign: 'center' }}>
                  <Text fz="xs" fw={600} lh={1.2}>
                    No
                  </Text>
                </TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text fz="xs" fw={600} lh={1.2}>
                    Nama Program Kreatif Desa
                  </Text>
                </TableTh>
                <TableTh style={{ width: '35%' }}>
                  <Text fz="xs" fw={600} lh={1.2}>
                    Deskripsi Singkat
                  </Text>
                </TableTh>
                <TableTh style={{ width: '10%', textAlign: 'center' }}>
                  <Text fz="xs" fw={600} lh={1.2}>
                    Ikon
                  </Text>
                </TableTh>
                <TableTh style={{ width: '15%', textAlign: 'center' }}>
                  <Text fz="xs" fw={600} lh={1.2}>
                    Detail
                  </Text>
                </TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item, index) => (
                <TableTr key={item.id}>
                  <TableTd ta="center" fz="sm" fw={500} lh={1.45}>
                    {index + 1}
                  </TableTd>
                  <TableTd>
                    <Text fz="sm" fw={500} lh={1.45} lineClamp={1}>
                      {item.name}
                    </Text>
                  </TableTd>
                  <TableTd>
                    <Text fz="sm" c="dimmed" lh={1.45} lineClamp={1}>
                      {item.slug}
                    </Text>
                  </TableTd>
                  <TableTd ta="center">
                    {iconMap[item.icon] && (
                      <Box title={item.icon}>
                        {React.createElement(iconMap[item.icon], { size: 24 })}
                      </Box>
                    )}
                  </TableTd>
                  <TableTd ta="center">
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      onClick={() =>
                        router.push(`/admin/inovasi/program-kreatif-desa/${item.id}`)
                      }
                    >
                      <IconDeviceImac size={18} />
                      <Text ml={6} fz="sm" fw={500}>
                        Detail
                      </Text>
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Box>

        {/* Mobile Cards */}
        <Box hiddenFrom="md">
          <Stack gap="md">
            {filteredData.map((item, index) => (
              <Paper key={item.id} p="md" withBorder radius="md">
                <Stack gap={4}>
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
                      Nama Program Kreatif Desa
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4} lineClamp={2}>
                      {item.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Deskripsi Singkat
                    </Text>
                    <Text fz="sm" fw={500} c="dimmed" lh={1.4} lineClamp={2}>
                      {item.slug}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Ikon
                    </Text>
                    <Box mt={4} ta="center">
                      {iconMap[item.icon] && (
                        <Box title={item.icon}>
                          {React.createElement(iconMap[item.icon], { size: 24 })}
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box ta="center" mt="sm">
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      onClick={() =>
                        router.push(`/admin/inovasi/program-kreatif-desa/${item.id}`)
                      }
                    >
                      <IconDeviceImac size={18} />
                      <Text ml={6} fz="sm" fw={500}>
                        Detail
                      </Text>
                    </Button>
                  </Box>
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
          mt="xl"
          mb="xl"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default ProgramKreatifDesa;