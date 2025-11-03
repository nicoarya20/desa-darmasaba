/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import colors from '@/con/colors';
import { Box, Button, Center, Group, Paper, Skeleton, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text, Title, Tooltip, Pagination } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import HeaderSearch from '../../../_com/header';
import perpustakaanDigitalState from '../../../_state/pendidikan/perpustakaan-digital';

function DataPerpustakaan() {
  const [search, setSearch] = useState('');
  return (
    <Box>
      <HeaderSearch
        title='Data Perpustakaan'
        placeholder='Cari judul, deskripsi, atau kategori...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListDataPerpustakaan search={search} />
    </Box>
  );
}

function ListDataPerpustakaan({ search }: { search: string }) {
  const listDataState = useProxy(perpustakaanDigitalState.dataPerpustakaan)
  const router = useRouter();

  const { data, page, totalPages, loading, load } = listDataState.findMany;

  useEffect(() => {
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || [];

  if (loading || !data) {
    return (
      <Stack py={10}>
        <Skeleton height={500} radius="md" />
      </Stack>
    )
  }

  return (
    <Box py={10}>
      <Paper withBorder bg={colors['white-1']} p="md" shadow="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>List Data Perpustakaan</Title>
          <Tooltip label="Tambah Data Perpustakaan" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/pendidikan/perpustakaan-digital/data-perpustakaan/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover withRowBorders style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '5%' }}>No</TableTh>
                <TableTh style={{ width: '25%' }}>Judul</TableTh>
                <TableTh style={{ width: '25%' }}>Kategori</TableTh>
                <TableTh style={{ width: '23%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '22%' }}>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableTr key={item.id}>
                    <TableTd style={{ width: '5%' }}>
                      <Text truncate fz="sm">{index + 1}</Text>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Text truncate fz="sm">{item.judul}</Text>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Text truncate fz="sm">{item.kategori.name}</Text>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Box w={150}>
                        <Text dangerouslySetInnerHTML={{ __html: item.deskripsi }} lineClamp={1} truncate fz="sm"/>
                      </Box>
                    </TableTd>
                    <TableTd style={{ width: '20%' }}>
                      <Button
                        variant="light"
                        color="blue"
                        onClick={() => router.push(`/admin/pendidikan/perpustakaan-digital/data-perpustakaan/${item.id}`)}
                      >
                        <IconDeviceImacCog size={20} />
                        <Text ml={5}>Detail</Text>
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data perpustakaan yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
            </TableTbody>
          </Table>
        </Box>
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
      </Paper>
    </Box>
  )
}

export default DataPerpustakaan;
