/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { IconDeviceImacCog, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../_com/header';
import JudulList from '../../_com/judulList';
import daftarInformasiPublik from '../../_state/ppid/daftar_informasi_publik/daftarInformasiPublik';

function DaftarInformasiPublik() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Daftar Informasi Publik Desa Darmasaba'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDaftarInformasi search={search} />
    </Box>
  );
}

function ListDaftarInformasi({ search }: { search: string }) {
  const listData = useProxy(daftarInformasiPublik)
  const router = useRouter()

  const { data, page, totalPages, loading, load } = listData.findMany

  useEffect(() => {
    load(page, 10)
  }, [page])


  const filteredData = (data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.jenisInformasi.toLowerCase().includes(keyword) ||
      item.deskripsi.toLowerCase().includes(keyword)
    );
  });

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={790} />
      </Stack>
    );
  }
  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper p="md" >
          <Stack>
            <JudulList
              title='List Daftar Informasi Publik Desa Darmasaba'
              href='/admin/ppid/daftar-informasi-publik-desa-darmasaba/create'
            />
            <Table striped withTableBorder withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Jenis Informasi</TableTh>
                  <TableTh>Deskripsi</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
            </Table>
            <Text ta="center">Tidak ada data daftar informasi publik yang tersedia</Text>
          </Stack>
        </Paper>
      </Box >
    );
  }

  return (
    <Box py={10}>
      <Paper bg={colors['white-1']} p={'md'} h={{ base: 870, md: 790 }}>
        <Stack>
          <JudulList
            title='List Daftar Informasi Publik Desa Darmasaba'
            href='/admin/ppid/daftar-informasi-publik-desa-darmasaba/create'
          />
          <Box style={{ overflowX: "auto" }}>
            <Table
              striped
              withTableBorder
              withRowBorders
              bg={colors['white-1']}
              style={{ minWidth: '700px' }}
            >
              <TableThead>
                <TableTr>
                  <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
                  <TableTh style={{ width: '20%' }}>Jenis Informasi</TableTh>
                  <TableTh style={{ width: '50%' }}>Deskripsi</TableTh>
                  <TableTh style={{ width: '15%', textAlign: 'center' }}>Detail</TableTh>
                </TableTr>
              </TableThead>
              <TableTbody>
                {filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ textAlign: 'center' }}>{index + 1}</TableTd>
                    <TableTd style={{ wordWrap: 'break-word' }}>
                      <Box w={200}>
                        <Text fz={"md"} truncate={"end"} lineClamp={1}>{item.jenisInformasi}</Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ wordWrap: 'break-word' }}>
                      <Box w={200}>
                        <Text fz={"md"} truncate={"end"} lineClamp={1} dangerouslySetInnerHTML={{ __html: item.deskripsi }}></Text>
                      </Box>
                    </TableTd>
                    <TableTd style={{ textAlign: 'center' }}>
                      <Button bg={"green"} onClick={() => router.push(`/admin/ppid/daftar-informasi-publik-desa-darmasaba/${item.id}`)}>
                        <IconDeviceImacCog size={25} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))}
              </TableTbody>
            </Table>
          </Box>
        </Stack>
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
  )
}

export default DaftarInformasiPublik;
