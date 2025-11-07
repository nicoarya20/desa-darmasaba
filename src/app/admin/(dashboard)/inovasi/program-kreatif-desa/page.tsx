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
  Title
} from '@mantine/core';
import {
  IconCash,
  IconChartLine,
  IconChristmasTreeFilled,
  IconClipboard,
  IconDeviceImac,
  IconDroplet,
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
  IconTrash,
  IconTree,
  IconTrendingUp,
  IconTrophy,
  IconTruck,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import programKreatifState from '../../_state/inovasi/program-kreatif';

function ProgramKreatifDesa() {
  const [search, setSearch] = useState("");
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

  useEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || []

  const iconMap: Record<string, React.FC<any>> = {
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
  };

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={650} radius="md" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper p="md" radius="md" shadow="sm" withBorder>
          <Stack>
            <Group justify="space-between" mb="md">
              <Title order={4}>Daftar Program Kreatif Desa</Title>
              <Button
                leftSection={<IconPlus size={18} />}
                color="blue"
                variant="light"
                onClick={() =>
                  router.push(
                    '/admin/inovasi/program-kreatif-desa/create'
                  )
                }
              >
                Tambah Baru
              </Button>
            </Group>
            <Table highlightOnHover striped>
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Nama Program Kreatif Desa</TableTh>
                  <TableTh>Deskripsi Singkat</TableTh>
                  <TableTh>Ikon</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
            </Table>
            <Text ta="center" c="dimmed" py="lg">
              Tidak ada data program kreatif desa yang tersedia
            </Text>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box py={10}>
      <Paper
        withBorder
        bg={colors['white-1']}
        p="lg"
        shadow="md"
        radius="md"
        h={{ base: 'auto', md: 650 }}
      >
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Program Kreatif Desa</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() =>
              router.push(
                '/admin/inovasi/program-kreatif-desa/create'
              )
            }
          >
            Tambah Baru
          </Button>
        </Group>
        <Box style={{ overflowY: 'auto' }}>
          <Table highlightOnHover striped >
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
                <TableTh style={{ width: '20%' }}>
                  <Text lineClamp={1} fw={"bold"} fz="sm">Nama Program Kreatif Desa</Text>
                </TableTh>
                <TableTh style={{ width: '35%' }}>Deskripsi Singkat</TableTh>
                <TableTh style={{ width: '10%', textAlign: 'center' }}>Ikon</TableTh>
                <TableTh style={{ width: '15%', textAlign: 'center' }}>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item, index) => (
                <TableTr key={item.id}>
                  <TableTd style={{ width: '5%', textAlign: 'center' }}>{index + 1}</TableTd>
                  <TableTd style={{ width: '20%', wordWrap: 'break-word' }}>
                    <Box w={200}>
                      <Text fw={500} lineClamp={1}>{item.name}</Text>
                    </Box>
                  </TableTd>
                  <TableTd style={{ width: '35%', wordWrap: 'break-word' }}>
                    <Box w={150}>
                      <Text fz="sm" c="dimmed" lineClamp={1}>
                        {item.slug}
                      </Text>
                    </Box>
                  </TableTd>
                  <TableTd style={{ width: '10%', textAlign: 'center' }}>
                    {iconMap[item.icon] && (
                      <Box title={item.icon}>
                        {React.createElement(iconMap[item.icon], { size: 24 })}
                      </Box>
                    )}
                  </TableTd>
                  <TableTd style={{ width: '15%', textAlign: 'center' }}>
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
                      <Text ml={6}>Detail</Text>
                    </Button>
                  </TableTd>
                </TableTr>
              ))}
            </TableTbody>
          </Table>
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

export default ProgramKreatifDesa;
