/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import {
  Box,
  Button,
  Center,
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
  IconChartLine,
  IconChristmasTreeFilled,
  IconClipboardTextFilled,
  IconDeviceImac,
  IconHomeEco,
  IconLeaf,
  IconPlus,
  IconRecycle,
  IconScale,
  IconSearch,
  IconShieldFilled,
  IconTent,
  IconTrashFilled,
  IconTrendingUp,
  IconTrophy,
  IconTruckFilled,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import programPenghijauanState from '../../_state/lingkungan/program-penghijauan';

function ProgramPenghijauan() {
  const [search, setSearch] = useState("");
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
  const listState = useProxy(programPenghijauanState)
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
  };

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={600} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        {/* Header Section */}
        <Box mb="md" display="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Title order={4}>Daftar Program Penghijauan</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            color="blue"
            variant="light"
            onClick={() => router.push('/admin/lingkungan/program-penghijauan/create')}
          >
            Tambah Baru
          </Button>
        </Box>

        {/* Table Section */}
        <Box style={{ overflowX: 'auto' }}>
          <Table highlightOnHover>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
                <TableTh style={{ width: '25%' }}>Nama Program</TableTh>
                <TableTh style={{ width: '35%' }}>Judul / Deskripsi</TableTh>
                <TableTh style={{ width: '15%', textAlign: 'center' }}>Ikon</TableTh>
                <TableTh style={{ width: '15%', textAlign: 'center' }}>Aksi</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ textAlign: 'center' }}>{index + 1}</TableTd>
                    <TableTd>
                      <Text fw={500} truncate="end" lineClamp={1}>{item.name}</Text>
                    </TableTd>
                    <TableTd>
                      <Text lineClamp={1} fz="sm" c="dimmed" dangerouslySetInnerHTML={{ __html: item.judul }} />
                    </TableTd>
                    <TableTd style={{ textAlign: 'center' }}>
                      {iconMap[item.icon] && (
                        <Box title={item.icon} mx="auto">
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
                        leftSection={<IconDeviceImac size={16} />}
                        onClick={() => router.push(`/admin/lingkungan/program-penghijauan/${item.id}`)}
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={5}>
                    <Center py={20}>
                      <Text c="dimmed">Tidak ada data program penghijauan yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
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
