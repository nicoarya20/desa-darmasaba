/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React from 'react';
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconCash, IconChristmasTreeFilled, IconClipboard, IconDeviceImac, IconDroplet, IconHome, IconHomeEco, IconHospital, IconScale, IconSchool, IconSearch, IconShieldFilled, IconShoppingCart, IconTrash, IconTree, IconTrendingUp, IconTruck } from '@tabler/icons-react';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import programKreatifState from '../../_state/inovasi/program-kreatif';
import { useProxy } from 'valtio/utils';
import {
  IconChartLine,
  IconLeaf,
  IconRecycle,
  IconTent,
  IconTrophy,
} from '@tabler/icons-react';

function ProgramKreatifDesa() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Program Kreatif Desa'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListProgramKreatifDesa search={search} />
    </Box>
  );
}

function ListProgramKreatifDesa({ search }: { search: string }) {
  const listState = useProxy(programKreatifState)
  const { data, loading, page, totalPages, load } = listState.findMany
  const router = useRouter();

  useEffect(() => {
    load(page, 10)
  }, [page])

  const filteredData = (data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.deskripsi.toLowerCase().includes(keyword) ||
      item.slug.toLowerCase().includes(keyword) ||
      item.icon.toLowerCase().includes(keyword)
    );
  });

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
    layananKesehatan: IconHospital
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
              title='List Program Kreatif Desa'
              href='/admin/inovasi/program-kreatif-desa/create'
            />
            <Table striped withTableBorder withRowBorders>
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
            <Text ta="center">Tidak ada data program kreatif desa yang tersedia</Text>
          </Stack>
        </Paper>
      </Box >
    );
  }
  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'} h={{ base: 'auto', md: 650 }}>
        <JudulList
          title='List Program Kreatif Desa'
          href='/admin/inovasi/program-kreatif-desa/create'
        />
        <Box style={{ overflowY: 'auto' }}>
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
                <TableTh style={{ width: '20%' }}>Nama Program Kreatif Desa</TableTh>
                <TableTh style={{ width: '35%' }}>Deskripsi Singkat</TableTh>
                <TableTh style={{ width: '10%' }}>Ikon</TableTh>
                <TableTh style={{ width: '15%', textAlign: 'center' }}>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.map((item, index) => (
                <TableTr key={item.id}>
                  <TableTd style={{ width: '5%', textAlign: 'center' }}>{index + 1}</TableTd>
                  <TableTd style={{ width: '20%', wordWrap: 'break-word' }}>{item.name}</TableTd>
                  <TableTd style={{ width: '35%', wordWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: item.slug }}></TableTd>
                  <TableTd style={{ width: '10%' }}>
                    {iconMap[item.icon] && (
                      <Box title={item.icon}>
                        {React.createElement(iconMap[item.icon], { size: 24 })}
                      </Box>
                    )}
                  </TableTd>
                  <TableTd style={{ width: '15%', textAlign: 'center' }}>
                    <Button onClick={() => router.push(`/admin/inovasi/program-kreatif-desa/${item.id}`)}>
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
export default ProgramKreatifDesa;
