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
import {
  IconAlertTriangle,
  IconAmbulance,
  IconBuilding,
  IconCash,
  IconChartLine,
  IconChristmasTreeFilled,
  IconClipboardTextFilled,
  IconDeviceImac,
  IconDroplet,
  IconFiretruck,
  IconHome,
  IconHomeEco,
  IconHospital,
  IconLeaf,
  IconPlus,
  IconRecycle,
  IconScale,
  IconSchool,
  IconSearch,
  IconShieldFilled,
  IconShoppingCart,
  IconTent,
  IconTrashFilled,
  IconTree,
  IconTrendingUp,
  IconTrophy,
  IconTruckFilled,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import programPenghijauanState from '../../_state/lingkungan/program-penghijauan';
import { useDebouncedValue } from '@mantine/hooks';

function ProgramPenghijauan() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Program Penghijauan'
        placeholder='Cari program penghijauan...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListProgramPenghijauan search={search} />
    </Box>
  );
}

function ListProgramPenghijauan({ search }: { search: string }) {
  const listState = useProxy(programPenghijauanState);
  const { data, loading, page, totalPages, load } = listState.findMany;
  const router = useRouter();
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  useEffect(() => {
    load(page, 10, debouncedSearch);
  }, [page, debouncedSearch]);

  const filteredData = data || [];

  const iconMap: Record<string, React.FC<any>> = {
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
    polisi: IconShieldFilled,
    ambulans: IconAmbulance,
    pemadam: IconFiretruck,
    rumahSakit: IconHospital,
    bangunan: IconBuilding,
    darurat: IconAlertTriangle,
  };

  if (loading || !data) {
    return (
      <Stack py="md">
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py="md">
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        {/* Header Section */}
        <Box mb="lg" visibleFrom="md">
          <Group
            justify="space-between"
            align="center"
            mb="md"
          >
            <Title order={4} size="md" lh={1.2}>
              Daftar Program Penghijauan
            </Title>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() =>
                router.push('/admin/lingkungan/program-penghijauan/create')
              }
            >
              Tambah Baru
            </Button>
          </Group>

          {/* Desktop Table */}
          <Box miw={0}>
            <Table
              highlightOnHover
              miw={0}
              style={{ tableLayout: 'fixed', width: '100%' }}
            >
              <TableThead>
                <TableTr>
                  <TableTh style={{ width: '5%', textAlign: 'center' }}>
                    <Text fz="xs" fw={600} lh={1.4} ta="center">
                      No
                    </Text>
                  </TableTh>
                  <TableTh style={{ width: '25%' }}>
                    <Text fz="xs" fw={600} lh={1.4}>
                      Nama Program
                    </Text>
                  </TableTh>
                  <TableTh style={{ width: '35%' }}>
                    <Text fz="xs" fw={600} lh={1.4}>
                      Judul / Deskripsi
                    </Text>
                  </TableTh>
                  <TableTh style={{ width: '15%', textAlign: 'center' }}>
                    <Text fz="xs" fw={600} lh={1.4} ta="center">
                      Ikon
                    </Text>
                  </TableTh>
                  <TableTh style={{ width: '20%', textAlign: 'center' }}>
                    <Text fz="xs" fw={600} lh={1.4} ta="center">
                      Aksi
                    </Text>
                  </TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <TableTr key={item.id}>
                      <TableTd ta="center">
                        <Text fz="sm" fw={500} lh={1.5}>
                          {index + 1}
                        </Text>
                      </TableTd>
                      <TableTd>
                        <Text fz="sm" fw={500} lh={1.5} truncate="end">
                          {item.name}
                        </Text>
                      </TableTd>
                      <TableTd>
                        <Text
                          fz="sm"
                          fw={500}
                          lh={1.5}
                          lineClamp={1}
                          dangerouslySetInnerHTML={{ __html: item.judul }}
                        />
                      </TableTd>
                      <TableTd ta="center">
                        {iconMap[item.icon] && (
                          <Box mx="auto" title={item.icon}>
                            {React.createElement(iconMap[item.icon], {
                              size: 22,
                            })}
                          </Box>
                        )}
                      </TableTd>
                      <TableTd ta="center">
                        <Button
                          size="xs"
                          radius="md"
                          variant="light"
                          color="blue"
                          leftSection={<IconDeviceImac size={16} />}
                          onClick={() =>
                            router.push(
                              `/admin/lingkungan/program-penghijauan/${item.id}`
                            )
                          }
                        >
                          Detail
                        </Button>
                      </TableTd>
                    </TableTr>
                  ))
                ) : (
                  <TableTr>
                    <TableTd colSpan={5}>
                      <Center py="xl">
                        <Text c="dimmed" fz="sm" lh={1.4}>
                          Tidak ada data program penghijauan yang cocok
                        </Text>
                      </Center>
                    </TableTd>
                  </TableTr>
                )}
              </TableTbody>
            </Table>
          </Box>
        </Box>

        {/* Mobile View – Card Layout */}
        <Box hiddenFrom="md">
          <Box mb="md">
            <Title order={4} size="sm" lh={1.2}>
              Daftar Program Penghijauan
            </Title>
          </Box>

          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            mb="lg"
            fullWidth
            onClick={() =>
              router.push('/admin/lingkungan/program-penghijauan/create')
            }
          >
            Tambah Baru
          </Button>

          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <Paper key={item.id} withBorder p="md" mb="sm" radius="md">
                <Stack gap="xs">
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
                      Nama Program
                    </Text>
                    <Text fz="sm" fw={500} lh={1.4}>
                      {item.name}
                    </Text>
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Judul / Deskripsi
                    </Text>
                    <Text
                      fz="sm"
                      fw={500}
                      lh={1.5}
                      dangerouslySetInnerHTML={{ __html: item.judul }}
                    />
                  </Box>
                  <Box>
                    <Text fz="sm" fw={600} lh={1.4}>
                      Ikon
                    </Text>
                    <Box mt="xs" ta="center">
                      {iconMap[item.icon] && (
                        React.createElement(iconMap[item.icon], { size: 24 })
                      )}
                    </Box>
                  </Box>
                  <Box>
                    <Button
                      size="xs"
                      radius="md"
                      variant="light"
                      color="blue"
                      leftSection={<IconDeviceImac size={16} />}
                      onClick={() =>
                        router.push(
                          `/admin/lingkungan/program-penghijauan/${item.id}`
                        )
                      }
                    >
                      Detail
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))
          ) : (
            <Center py="xl">
              <Text c="dimmed" fz="sm" lh={1.4}>
                Tidak ada data program penghijauan yang cocok
              </Text>
            </Center>
          )}
        </Box>
      </Paper>

      {/* Pagination */}
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

export default ProgramPenghijauan;