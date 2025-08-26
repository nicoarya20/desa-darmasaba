/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import {
  IconChartLine, IconChristmasTreeFilled, IconClipboardTextFilled, IconDeviceImac, IconDroplet, IconHome, IconHomeEco, IconLeaf,
  IconRecycle, IconScale, IconSearch, IconShieldFilled, IconTent,
  IconTrashFilled,
  IconTree,
  IconTrendingUp,
  IconTrophy,
  IconTruckFilled
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import dataLingkunganDesaState from '../../_state/lingkungan/data-lingkungan-desa';


function DataLingkunganDesa() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Data Lingkungan Desa'
        placeholder='pencarian'
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
        <Skeleton height={650} />
      </Stack>
    );
  }
  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper p="md" >
          <Stack>
            <JudulList
              title='List Data Lingkungan Desa'
              href='/admin/lingkungan/data-lingkungan-desa/create'
            />
            <Table striped withTableBorder withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Nama Data Lingkungan Desa</TableTh>
                  <TableTh>Jumlah Data Lingkungan Desa</TableTh>
                  <TableTh>Ikon</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
            </Table>
            <Text ta="center">Tidak ada data lingkungan desa yang tersedia</Text>
          </Stack>
        </Paper>
      </Box >
    );
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'} h={{ base: 'auto', md: 650 }}>
        <JudulList
          title='List Data Lingkungan Desa'
          href='/admin/lingkungan/data-lingkungan-desa/create'
        />
        <Box style={{ overflowY: 'auto' }}>
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
                <TableTh style={{ width: '20%' }}>Nama Data Lingkungan Desa</TableTh>
                <TableTh style={{ width: '35%' }}>Jumlah Data Lingkungan Desa</TableTh>
                <TableTh style={{ width: '10%' }}>Ikon</TableTh>
                <TableTh style={{ width: '15%', textAlign: 'center' }}>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item, index) => (
                <TableTr key={item.id}>
                  <TableTd style={{ width: '5%', textAlign: 'center' }}>{index + 1}</TableTd>
                  <TableTd style={{ width: '20%', wordWrap: 'break-word' }}>{item.name}</TableTd>
                  <TableTd style={{ width: '35%', wordWrap: 'break-word' }}>± {item.jumlah}</TableTd>
                  <TableTd style={{ width: '10%' }}>
                    {iconMap[item.icon] && (
                      <Box title={item.icon}>
                        {React.createElement(iconMap[item.icon], { size: 24 })}
                      </Box>
                    )}
                  </TableTd>
                  <TableTd style={{ width: '15%', textAlign: 'center' }}>
                    <Button onClick={() => router.push(`/admin/lingkungan/data-lingkungan-desa/${item.id}`)}>
                      <IconDeviceImac size={25} />
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
            window.scrollTo(0, 0);
          }}
          total={totalPages}
          mt="md"
          mb="md"
        />
      </Center>
    </Box>
  );
}
export default DataLingkunganDesa;
