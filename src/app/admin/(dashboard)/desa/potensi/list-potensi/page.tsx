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
  Tooltip
} from '@mantine/core';
import { IconDeviceImacCog, IconPlus, IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';
import HeaderSearch from '../../../_com/header';
import potensiDesaState from '../../../_state/desa/potensi';

function Potensi() {
  const [search, setSearch] = useState("");
  return (
    <Box>
      <HeaderSearch
        title='Potensi Desa'
        placeholder='Cari potensi atau kategori...'
        searchIcon={<IconSearch size={20} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <ListPotensi search={search} />
    </Box>
  );
}

function ListPotensi({ search }: { search: string }) {
  const potensiState = useProxy(potensiDesaState);
  const router = useRouter();

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = potensiState.potensiDesa.findMany;

  useEffect(() => {
    potensiState.kategoriPotensi.findMany.load();
    load(page, 10, search);
  }, [page, search]);

  const filteredData = data || []

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
        <Group justify="space-between" mb="md">
          <Title order={4}>Daftar Potensi Desa</Title>
          <Tooltip label="Tambah Potensi" withArrow>
            <Button
              leftSection={<IconPlus size={18} />}
              color="blue"
              variant="light"
              onClick={() => router.push('/admin/desa/potensi/list-potensi/create')}
            >
              Tambah Baru
            </Button>
          </Tooltip>
        </Group>
        <Box style={{ overflowX: "auto" }}>
          <Table highlightOnHover style={{ minWidth: '700px' }}>
            <TableThead>
              <TableTr>
                <TableTh style={{ width: '20%' }}>Judul</TableTh>
                <TableTh style={{ width: '20%' }}>Kategori</TableTh>
                <TableTh style={{ width: '35%' }}>Deskripsi</TableTh>
                <TableTh style={{ width: '15%' }}>Detail</TableTh>
              </TableTr>
            </TableThead>
            <TableTbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableTr key={item.id}>
                    <TableTd>
                      <Text fw={500} truncate="end" lineClamp={1}>
                        {item.name}
                      </Text>
                    </TableTd>
                    <TableTd>
                      <Text fz="sm" c="dimmed">{item.kategori?.nama || '-'}</Text>
                    </TableTd>
                    <TableTd>
                      <Box w={300}>
                        <Text
                          truncate
                          fz="sm"
                          dangerouslySetInnerHTML={{ __html: item.deskripsi }}
                          style={{wordBreak: "break-word", whiteSpace: "normal"}}
                        />
                      </Box>
                    </TableTd>
                    <TableTd>
                      <Button
                        size="xs"
                        radius="md"
                        variant="light"
                        color="blue"
                        leftSection={<IconDeviceImacCog size={16} />}
                        onClick={() => router.push(`/admin/desa/potensi/list-potensi/${item.id}`)}
                      >
                        Detail
                      </Button>
                    </TableTd>
                  </TableTr>
                ))
              ) : (
                <TableTr>
                  <TableTd colSpan={4}>
                    <Center py={20}>
                      <Text color="dimmed">Tidak ada data potensi yang cocok</Text>
                    </Center>
                  </TableTd>
                </TableTr>
              )}
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

export default Potensi;
