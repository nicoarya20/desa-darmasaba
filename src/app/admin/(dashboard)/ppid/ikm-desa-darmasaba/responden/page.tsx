'use client';
import colors from '@/con/colors';
import { Box, Button, Center, Pagination, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconDeviceImac, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import JudulList from '../../../_com/judulList';
import indeksKepuasanState from '../../../_state/landing-page/indeks-kepuasan';

function Responden() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Responden'
        placeholder='pencarian'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListResponden search={search} />
    </Box>
  );
}

interface ListRespondenProps {
  search: string;
}

function ListResponden({ search }: ListRespondenProps) {
  const state = useProxy(indeksKepuasanState.responden);
  const router = useRouter();
  const { data, page, totalPages, loading, load } = state.findMany;


  useShallowEffect(() => {
    load(page, 10)
  }, [page]);


  const filteredData = (data || []).filter(item => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword)
    );
  });

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={730} />
      </Stack>
    );
  }
  if (data.length === 0) {
    return (
      <Box py={10}>
        <Paper p="md">
          <Stack>
            <JudulList
              title='List Data Berdasarkan Jenis Kelamin Responden'
              href='/admin/ppid/ikm-desa-darmasaba/responden/create'
            />
            <Table striped withTableBorder withRowBorders>
              <TableThead>
                <TableTr>
                  <TableTh>No</TableTh>
                  <TableTh>Nama</TableTh>
                  <TableTh>Tanggal</TableTh>
                  <TableTh>Jenis Kelamin</TableTh>
                  <TableTh>Detail</TableTh>
                </TableTr>
              </TableThead>
            </Table>
            <Text ta="center">Tidak ada data berdasarkan jenis kelamin responden yang tersedia</Text>
          </Stack>
        </Paper>
      </Box >
    );
  }

  return (
    <Box>
      <Stack gap="xs">
        <Paper bg={colors['white-1']} p="md" h={{ base: 730, md: 650 }}>
          <JudulList
            title='List Data Responden'
            href='/admin/ppid/ikm-desa-darmasaba/responden/create'
          />
          <Table striped withTableBorder withRowBorders>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '5%', textAlign: 'center' }}>No</TableTh>
                <TableTh style={{ width: '20%', textAlign: 'center' }}>Nama</TableTh>
                <TableTh style={{ width: '20%', textAlign: 'center' }}>Tanggal</TableTh>
                <TableTh style={{ width: '20%', textAlign: 'center' }}>Jenis Kelamin</TableTh>
                <TableTh style={{ width: '15%', textAlign: 'center' }}>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length === 0 ? (
                <TableTr>
                  <TableTd colSpan={6}>
                    <Text ta='center' c='dimmed'>Belum ada data responden</Text>
                  </TableTd>
                </TableTr>
              ) : (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '5%', textAlign: 'center' }}>{index + 1}</TableTd>
                    <TableTd style={{ width: '20%', textAlign: 'center' }}>{item.name}</TableTd>
                    <TableTd style={{ width: '20%', textAlign: 'center' }}>{item.tanggal
                      ? new Date(item.tanggal).toLocaleDateString('id-ID')
                      : '-'}</TableTd>
                    <TableTd style={{ width: '20%', textAlign: 'center' }}>{item.jenisKelamin.name}</TableTd>
                    <TableTd style={{ width: '15%', textAlign: 'center' }}>
                      <Button color='green' onClick={() => router.push(`/admin/ppid/ikm-desa-darmasaba/responden/${item.id}`)}>
                        <IconDeviceImac size={20} />
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              )}
            </TableTbody>
          </Table>
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

       
      </Stack>
    </Box>
  );
}

export default Responden;


