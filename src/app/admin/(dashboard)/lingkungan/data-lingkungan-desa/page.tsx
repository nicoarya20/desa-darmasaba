/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box, Button, Center, Group, Pagination, Paper, Skeleton, Stack,
  Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text,
  Title
} from '@mantine/core';
import {
  IconChartLine, IconChristmasTreeFilled, IconClipboardTextFilled,
  IconDeviceImacCog, IconDroplet, IconHome, IconHomeEco, IconLeaf,
  IconPlus,
  IconRecycle, IconScale, IconSearch, IconShieldFilled, IconTent,
  IconTrashFilled, IconTree, IconTrendingUp, IconTrophy, IconTruckFilled
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import dataLingkunganDesaState from '../../_state/lingkungan/data-lingkungan-desa';


function DataLingkunganDesa() {
  const [search, setSearch] = useState("");
  return (
    <Box>
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
  const listState = useProxy(dataLingkunganDesaState)
  const { data, loading, page, totalPages, load } = listState.findMany
  const router = useRouter();

  useEffect(() => {
    load(page, 10, search)
  }, [page, search])

  const filteredData = data || []

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
    air: IconDroplet
  };

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper withBorder shadow="md" radius="md" p="lg" bg={colors['white-1']}>
          <Stack>
            <Group justify="space-between" mb="md">
              <Title order={4}>Daftar Data Lingkungan Desa</Title>
              <Button leftSection={<IconPlus size={18} />} color="blue" variant="light" onClick={() => router.push('/admin/lingkungan/data-lingkungan-desa/create')}>
                Tambah Baru
              </Button>
            </Group>
            <Table highlightOnHover>
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Nama Data Lingkungan Desa</TableTh>
                  <TableTh>Jumlah</TableTh>
                  <TableTh>Ikon</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
            </Table>
            <Center py={20}>
              <Text c="dimmed">Tidak ada data lingkungan desa yang tersedia</Text>
            </Center>
          </Stack>
        </Paper>
      </Box >
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder shadow="md" radius="md" bg={colors['white-1']} p="lg">
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Data Lingkungan Desa</Title>
          <Button leftSection={<IconPlus size={18} />} color="blue" variant="light" onClick={() => router.push('/admin/lingkungan/data-lingkungan-desa/create')}>
            Tambah Baru
          </Button>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
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
                  <TableTd style={{ textAlign: 'center' }}>{index + 1}</TableTd>
                  <TableTd>
                    <Text fw={500} truncate="end" lineClamp={1}>{item.name}</Text>
                  </TableTd>
                  <TableTd>
                    <Text fz="sm" c="dimmed">± {item.jumlah}</Text>
                  </TableTd>
                  <TableTd>
                    {iconMap[item.icon] && (
                      <Box title={item.icon}>
                        {React.createElement(iconMap[item.icon], { size: 22 })}
                      </Box>
                    )}
                  </TableTd>
                  <TableTd style={{ textAlign: 'center' }}>
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
